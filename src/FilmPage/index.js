import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useFilm } from "../hooks/useFilm"
import { useParams } from "react-router-dom";
import { Button, Image, ScrollShadow, Select, SelectItem, Tab, Tabs } from "@nextui-org/react";
import { getFilmStateFromStorage, getWatchingProgress } from "../utils/localStorageUtils";
import { LoaderOverlay } from "../components/Loader";
import { hitPageLoad } from "../utils/ym";
import { SequelsAndPrequels } from "./SequelsAndPrequels";
import { AnimatedDiv } from "../components/AnimatedDiv";
import { AnimatePresence, motion } from "framer-motion";
import { Reload } from "../components/icons/Reload";
import { ProgressLine } from "../components/ProgressLine";
import { useResizeObserver } from "../hooks/useResizeObserver";
import { ChevronLeftIcon } from "../components/icons/ChevronLeftIcon";
import { ChevronRightIcon } from "../components/icons/ChevronRightIcon";
import { ChevronUpIcon } from "../components/icons/ChevronUpIcon";
import { ChevronDownIcon } from "../components/icons/ChevronDownIcon";

const TranslatorsSelect = ({
    className = '',
    translators = [],
    selected,
    onSelect,
    isDisabled
}) => {
    const translatorsExtendedList = useMemo(() => {
        if (selected === '') {
            return [
                { id: '', token: '', name: "По умолчанию" },
                ...translators
            ]
        } else {
            return translators;
        }
    }, [translators, selected]);

    const onChange = useCallback(({ target }) => {
        onSelect(target.value);
    }, [onSelect]);

    if (translators.length < 2) {
        return null;
    };

    return <Select 
        className={className}
        isDisabled={isDisabled}
        label="Перевод" 
        variant="faded"
        selectionMode="single"
        selectedKeys={new Set([selected])}
        onChange={onChange}
    >
        {
            translatorsExtendedList.map(translator => (<SelectItem key={translator.id}>
                {translator.name}
            </SelectItem>))
        }
    </Select>
}

const SeasonsList = ({ className, seasons, selectedSeason, onSelect }) => {
    const seasonsRef = useRef();
    const [showChevron, setShowChevron] = useState(true);

    useResizeObserver(() => setShowChevron(seasonsRef.current.offsetWidth < seasonsRef.current.scrollWidth));

    const scrollHorizontally = (mult) => {
        seasonsRef.current.scrollTo({
            left: seasonsRef.current.scrollLeft + mult * seasonsRef.current.clientWidth * 0.9,
            behavior: 'smooth'
        })
    }

    useEffect(() => {
        if (seasons && seasonsRef.current) {
            const selectedSeasonElement = seasonsRef.current.querySelector(`button[data-key="${selectedSeason}"]`);
            const selectedSeasonOffsetLeft = selectedSeasonElement?.offsetLeft - seasonsRef.current.offsetWidth / 2 + selectedSeasonElement?.offsetWidth / 2; 
            seasonsRef.current.scrollLeft = selectedSeasonOffsetLeft;
        }
    }, [seasons, selectedSeason]);

    return <div className={"relative " + className}>
        <ScrollShadow orientation="horizontal" ref={seasonsRef} hideScrollBar>
            <Tabs variant="underlined" onSelectionChange={key => onSelect(+key)} selectedKey={selectedSeason?.toString()} className="mb-2">
                {seasons?.map(season => (
                    <Tab key={season.id} title={season.name} />
                ))}
            </Tabs>
        </ScrollShadow>
        {showChevron && <Button className="absolute -left-4 top-1 z-20" size='sm' variant='light' isIconOnly radius="full" onClick={() => scrollHorizontally(-1)}>
                <ChevronLeftIcon className='w-4 h-4'/>
            </Button>}
        {showChevron && <Button className="absolute -right-4 top-1 z-20" size='sm' variant='light' isIconOnly radius="full" onClick={() => scrollHorizontally(1)}>
            <ChevronRightIcon className='w-4 h-4'/>
        </Button>}
    </div>
} 

const EpisodeTile = forwardRef(({ 
    selected, 
    onClick, 
    id,
    title,
    nameRu,
    nameEn,
    releaseDate,
    synopsis,
    progress = 0.5,
}, ref) => {
    const titleToShow = useMemo(() => {
        if (nameRu || nameEn) {
            return `${id}. ${nameRu || nameEn}`;
        } else {
            return title;
        }
    }, [nameRu, nameEn, title, id]);
    
    return <motion.div 
        key={id}
        ref={ref}
        className={`relative px-3 py-2 m-2 cursor-pointer border-2 border-white/15 rounded-xl overflow-hidden
            hover:border-white/60 hover:bg-white/10 transition-colors ${selected ? "bg-fuchsia-700/20 border-3 border-fuchsia-700/50" : ""}`}
        onClick={onClick}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 500, damping: 15 }} 
        animate={{
            scale: selected ? 1.02 : 1.0
        }}
    >
        <p className="text-base line-clamp-1 font-jura font-bold">{titleToShow}</p>
        <p className="text-xs opacity-70 line-clamp-2">{synopsis}</p>
        {!selected && <ProgressLine className="absolute left-0 bottom-0" progress={progress}/>}
    </motion.div>
});

const EpisodesList = ({ className, id, seasonId, episodes, selectedEpisode, onSelect }) => {
    const [showTopChevron, setShowTopChevron] = useState(true);
    const [showBottomChevron, setShowBottomChevron] = useState(true);
    const episodesListRef = useRef();
    const selectedEpisodeRef = useRef();

    window.ref = episodesListRef;
    
    useEffect(() => {
        const updateChevronVisibility = (e) => {
            setShowTopChevron(e.target.scrollTop > 0);
            setShowBottomChevron(e.target.scrollTop + e.target.offsetHeight < e.target.scrollHeight - 5);
        };
        episodesListRef.current.addEventListener('scroll', updateChevronVisibility);
        
        const episodeListCopy = episodesListRef.current;

        return () => episodeListCopy.removeEventListener('scroll', updateChevronVisibility);
    }, []);

    const scrollVertically = (mult) => {
        episodesListRef.current.scrollTo({
            top: episodesListRef.current.scrollTop + mult * episodesListRef.current.clientHeight * 0.9,
            behavior: 'smooth'
        })
    }

    useEffect(() => {
        if (selectedEpisode && episodesListRef.current && selectedEpisodeRef.current) {
            episodesListRef.current.scrollTop = selectedEpisodeRef.current.offsetTop - episodesListRef.current.offsetHeight / 2 + selectedEpisodeRef.current.offsetHeight / 2;
        }
    }, [selectedEpisode]);

    const onClick = (episodeId) => {
        selectedEpisodeRef.current = null;
        onSelect(episodeId);
    }

    return <>
        <ScrollShadow hideScrollBar className={"relative scroll-smooth " + className} ref={episodesListRef}>
            {episodes?.map(episode => (
                <EpisodeTile 
                    key={episode.id}
                    ref={selectedEpisode === episode.id ? selectedEpisodeRef : null}
                    selected={selectedEpisode === episode.id}
                    onClick={() => onClick(episode.id)}
                    id={episode.id}
                    title={episode.title}
                    nameRu={episode.nameRu}
                    nameEn={episode.nameEn}
                    synopsis={episode.synopsis}
                    releaseDate={episode.releaseDate}
                    progress={getWatchingProgress({ id, season: seasonId, episode: episode.id })}
                />
            ))}
        </ScrollShadow>
        {showTopChevron && <Button className="absolute -top-5 left-[calc(50%-1.25rem)] z-20" variant='light' isIconOnly radius="full" onClick={() => scrollVertically(-1)}>
            <ChevronUpIcon className='w-6 h-6'/>
        </Button>}
        {showBottomChevron && <Button className="absolute -bottom-5 left-[calc(50%-1.25rem)] z-20" variant='light' isIconOnly radius="full" onClick={() => scrollVertically(1)}>
            <ChevronDownIcon className='w-6 h-6'/>
        </Button>}
    </>;
}

const getPageTitle = (filmName) => `${filmName} - Metrpiva HD`;

const usePageTitle = (filmName) => {
    useEffect(() => {
        if (filmName) {
            document.title = getPageTitle(filmName);
        }
    }, [filmName]);
}

const useHitFilmPageLoad = (filmName) => {
    useEffect(() => {
        if (filmName) {
            hitPageLoad(document.location.pathname, getPageTitle(filmName))
        }
    }, [filmName]);
}

const PosterImage = ({ url }) => {
    return <div className="fixed z-0 top-0 left-0">
        <Image 
            src={url}
            radius="none"
            className="data-[loaded=true]:opacity-10 min-h-dvh object-cover z-0"
        />
        <div className="absolute h-full w-full top-0 z-1 bg-gradient-to-l from-[#0D0D0F]"></div>
    </div>
}

const ReloadButton = () => {
    const onClick = useCallback(() => {
        document.location.reload();
    }, [])
    return <Button 
        onClick={onClick}
        variant="light"
        radius="full"
        isIconOnly 
    >
        <Reload className="w-6 opacity-80"/>
    </Button>
}

const TitleBlock = ({ 
    className, 
    nameRu, 
    nameOriginal, 
    year, 
    filmLength,
    isSerial,
    ratingKinopoisk,
    ratingImdb,
    countries,
    genres
}) => {
    const filmLengthString = useMemo(() => {
        if (isSerial) {
            return 'сериал'
        }
        if (!filmLength) {
            return ''
        }

        if (filmLength >= 60) {
            return `${Math.floor(filmLength / 60)} ч ${filmLength % 60} мин`;
        } else {
            return `${filmLength} мин`
        }
    }, [filmLength, isSerial]);

    const infolineA = [];

    if (nameRu && nameOriginal) {
        infolineA.push(nameOriginal);
    }
    if (year) {
        infolineA.push(`${year} год`);
    }
    if (filmLengthString) {
        infolineA.push(filmLengthString);
    }

    const infolineB = [];

    if (countries?.length) {
        infolineB.push(...countries.map(({ country }) => country));
    }
    if (genres?.length) {
        infolineB.push(...genres.map(({ genre }) => genre));
    };

    const Rating = ({ className, label, rating }) => {
        return <div className={`flex items-center border-2 rounded px-2 opacity-70 font-jura ${className}`}>
            <p className="text-xs mr-2">{label}</p>
            <p className="font-semibold">{rating}</p>
        </div>
    }

    return <div className={`${className}`}>
        <div className="flex items-center flex-wrap">
            <h1 className="text-3xl pb-2 mr-3">{nameRu || nameOriginal}</h1>
            {!!ratingKinopoisk && <Rating className='mr-3' label='КП' rating={ratingKinopoisk}/>}
            {!!ratingImdb && <Rating className='mr-3' label='IMDB' rating={ratingImdb}/>}
            <ReloadButton />
        </div>
        {infolineA.length > 0 && <h3 className="opacity-70">{infolineA.join(', ')}</h3>}
        {infolineB.length > 0 && <h4 className="opacity-70">{infolineB.join(' / ')}</h4>}
    </div>
}

const FilmPage = () => {
    const { id } = useParams();
    const initFilmStateFromStorage = useMemo(
        () => getFilmStateFromStorage(id), 
        [id]
    );
    const {
        isFilmDataLoading,
        isBalancerInitFilmDataLoading,
        isStreamLoading,
        isError,
        isPlaying,
        filmData,
        balancerData,
        balancerEpisodes,
        selectedTranslator,
        updateSelectedTranslator,
        episodes,
        selectedSeasonEpisode,
        updateSelectedSeasonEpisode
    } = useFilm(id, initFilmStateFromStorage);

    usePageTitle(filmData.nameRu || filmData.nameOriginal);
    useHitFilmPageLoad(filmData.nameRu || filmData.nameOriginal);

    const [openSeason, setOpenSeason] = useState(balancerEpisodes.seasons?.[0]?.id);
    const hasSeasons = balancerData.hasSeasons;
    const isShowLoader = useMemo(() => isFilmDataLoading || isBalancerInitFilmDataLoading,
        [isBalancerInitFilmDataLoading, isFilmDataLoading]);

    useEffect(() => {
        if (selectedSeasonEpisode?.season || selectedSeasonEpisode?.season === 0) {
            setOpenSeason(selectedSeasonEpisode.season);
        } else {
            setOpenSeason(balancerEpisodes.seasons?.[0]?.id || null);
        }
    }, [selectedSeasonEpisode, balancerEpisodes.seasons]);

    useEffect(() => {
        window.scrollTo({top: 0, behavior: 'smooth'});
    }, [id]);


    return <>
        <AnimatePresence>
            {isShowLoader && <LoaderOverlay />}
        </AnimatePresence>
        <PosterImage url={filmData.posterUrl} />
        <div className={`mt-6 relative z-10 grid grid-cols-12 gap-4 
            ${isShowLoader ? 'opacity-0 max-h-0 overflow-hidden' : 'opacity-1'} duration-500` }>
            <TitleBlock 
                className={`col-start-1 col-end-13
                    ${hasSeasons ? 'sm:col-end-13' : 'sm:col-start-3 sm:col-end-11'}`}
                nameRu={filmData.nameRu}
                nameOriginal={filmData.nameOriginal}
                year={filmData.year}
                filmLength={filmData.filmLength}
                isSerial={filmData.serial}
                ratingKinopoisk={filmData.ratingKinopoisk}
                ratingImdb={filmData.ratingImdb}
                countries={filmData.countries}
                genres={filmData.genres}
            />
            <TranslatorsSelect 
                className={`col-start-1 col-end-9 
                    ${hasSeasons ? 'sm:col-end-4' : 'sm:col-start-3 sm:col-end-6'}`}
                translators={balancerData.translators} 
                isDisabled={isStreamLoading}
                selected={selectedTranslator} 
                onSelect={updateSelectedTranslator}
            />
            {hasSeasons && <SeasonsList 
                className="col-start-1 col-end-13 sm:col-end-9"
                seasons={balancerEpisodes.seasons}
                selectedSeason={openSeason}
                onSelect={setOpenSeason}
            />}
            {selectedSeasonEpisode?.episode && document.getElementById('oframeplayer') &&
                createPortal(
                    <div className={`backdrop-blur-sm bg-black/50 absolute z-10 p-3 pr-5 rounded-br-full transition-opacity shadow ${
                        isPlaying ? 'opacity-0' : ''}`}>
                        <p className="opacity-80 text-xs">
                            Сезон {selectedSeasonEpisode.season} | Серия {selectedSeasonEpisode.episode}
                        </p>
                    </div>,
                    document.getElementById('oframeplayer')
                )
            }
            {isStreamLoading && document.getElementById('oframeplayer') &&
                createPortal(
                    <LoaderOverlay />,
                    document.getElementById('oframeplayer')
                )
            }
            <div 
                id="player" 
                className={`shadow-lg rounded-xl ring-2 ring-white/5 overflow-hidden
                    col-start-1 col-end-13 ${hasSeasons ? 'sm:col-end-9' : 'sm:col-start-3 sm:col-end-11'}
                    ${isError && 'hidden'}`}
            />
            {isError && <p className="py-20 text-center text-2xl opacity-80 col-start-1 col-end-13 sm:col-start-3 sm:col-end-11">
                Похоже этого фильма нет в базе балансёра. Либо произошла ошибка при загрузке :(   
            </p>}
            {!!episodes?.[openSeason] && <AnimatedDiv className="shadow-lg max-h-72 sm:h-0 min-h-full 
                col-start-1 sm:col-start-9 col-end-13 relative">
                <EpisodesList 
                    className="h-full"
                    id={id}
                    seasonId={openSeason}
                    episodes={episodes?.[openSeason]}
                    selectedEpisode={openSeason === selectedSeasonEpisode?.season ? selectedSeasonEpisode?.episode : null}
                    onSelect={(episode) => updateSelectedSeasonEpisode(openSeason, episode)}
                />
            </AnimatedDiv>}
            <p className={`col-start-1 col-end-12 mt-2 sm:mt-4
                    ${hasSeasons ? 'sm:col-end-9' : 'sm:col-start-3 sm:col-end-11'} text-sm opacity-80`}>{filmData.description}</p>
            <SequelsAndPrequels 
                className="col-start-1 col-end-13 mt-2"
                sequelsAndPrequels={filmData.sequelsAndPrequels} 
            />
        </div>
    </>
}

export const FilmPageWrapper = () => {
    const { id } = useParams();

    return <FilmPage key={id} />
}