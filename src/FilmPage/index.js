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
        className={"shadow " + className}
        isDisabled={isDisabled}
        label="Перевод" 
        variant="bordered"
        selectionMode="single"
        radius="sm"
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

    useEffect(() => {
        if (seasons && seasonsRef.current) {
            const selectedSeasonElement = seasonsRef.current.querySelector(`button[data-key="${selectedSeason}"]`);
            const selectedSeasonOffsetLeft = selectedSeasonElement?.offsetLeft - seasonsRef.current.offsetWidth / 2 + selectedSeasonElement?.offsetWidth / 2; 
            seasonsRef.current.scrollLeft = selectedSeasonOffsetLeft;
        }
    }, [seasons, selectedSeason]);

    return <ScrollShadow orientation="horizontal" className={"relative " + className} ref={seasonsRef}>
        <Tabs variant="underlined" onSelectionChange={key => onSelect(+key)} selectedKey={selectedSeason?.toString()} className="mb-2">
            {seasons?.map(season => (
                <Tab key={season.id} title={season.name} />
            ))}
        </Tabs>
    </ScrollShadow>
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
        className={`relative px-3 py-2 m-2 cursor-pointer border border-white/15 rounded overflow-hidden
            ${selected ? "bg-white/20 border-white/50" : ""}`}
        onClick={onClick}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 500, damping: 15 }} 
        animate={{
            scale: selected ? 1.02 : 1.0
        }}
    >
        <p className="text-base line-clamp-1">{titleToShow}</p>
        <p className="text-xs opacity-70 line-clamp-2">{synopsis}</p>
        {!selected && <ProgressLine className="absolute left-0 bottom-0" progress={progress}/>}
    </motion.div>
});

const EpisodesList = ({ className, id, seasonId, episodes, selectedEpisode, onSelect }) => {
    const episodesListRef = useRef();
    const selectedEpisodeRef = useRef();
    
    useEffect(() => {
        if (selectedEpisode && episodesListRef.current && selectedEpisodeRef.current) {
            episodesListRef.current.scrollTop = selectedEpisodeRef.current.offsetTop - episodesListRef.current.offsetHeight / 2 + selectedEpisodeRef.current.offsetHeight / 2;
        }
    }, [selectedEpisode]);

    const onClick = (episodeId) => {
        selectedEpisodeRef.current = null;
        onSelect(episodeId);
    }

    return <ScrollShadow hideScrollBar className={"relative scroll-smooth " + className} ref={episodesListRef}>
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

const AdditionalInfo = ({
    className = "",
    description,
    countries,
    filmLength,
    genres,
    ratingImdb,
    ratingKinopoisk,
    year
}) => {
    return <div className={"grid cols-2 gap-4 " + className}>
        {year && <><p>Год: </p><p>{year}</p></>}
        {!!countries?.length && <><p>Страна: </p><p>{countries?.map(({ country }) => country)?.join(', ')}</p></>}
        {filmLength && <><p>Продолжительность: </p><p>{filmLength} минут</p></>}
        {!!genres?.length && <><p>Жанр: </p><p>{genres?.map(({ genre }) => genre)?.join(', ')}</p></>}
        <p>Рейтинг: </p><p>КП: {ratingKinopoisk} &nbsp;&nbsp;&nbsp; IMDB: {ratingImdb}</p>
        <p className="col-span-2">{description}</p>
    </div>
}

const PosterImage = ({ url }) => {
    return <div className="fixed z-0 top-0 left-0">
        <Image 
            src={url}
            radius="none"
            className="data-[loaded=true]:opacity-30 min-h-dvh object-cover z-0"
        />
        <div className="absolute h-full w-full top-0 z-1 bg-gradient-to-l from-black"></div>
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
    console.log(balancerEpisodes.seasons);
    return <>
        <AnimatePresence>
            {isShowLoader && <LoaderOverlay />}
        </AnimatePresence>
        <PosterImage url={filmData.posterUrl} />
        <div className={`mt-6 relative z-10 grid grid-cols-12 gap-4 
            ${isShowLoader ? 'opacity-0' : 'opacity-1'} duration-500` }>
            <div className={`col-start-1 col-end-13 transition-all 
                ${hasSeasons ? 'sm:col-end-9' : 'sm:col-start-3 sm:col-end-11'}`}>
                <div className="flex gap-3 items-center">
                    <h1 className="text-3xl">{filmData.nameRu}</h1>
                    <ReloadButton />
                </div>
                <h3 className="opacity-70">{filmData.nameOriginal}</h3>
            </div>
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
            {!!episodes?.[openSeason] && <AnimatedDiv className="shadow-lg max-h-72 sm:h-0 sm:min-h-full 
                col-start-1 sm:col-start-9 col-end-13">
                <EpisodesList 
                    className="h-full"
                    id={id}
                    seasonId={openSeason}
                    episodes={episodes?.[openSeason]}
                    selectedEpisode={openSeason === selectedSeasonEpisode?.season ? selectedSeasonEpisode?.episode : null}
                    onSelect={(episode) => updateSelectedSeasonEpisode(openSeason, episode)}
                />
            </AnimatedDiv>}
            <AdditionalInfo 
                className={`col-start-1 col-end-12 mt-4 sm:mt-8
                    ${hasSeasons ? 'sm:col-end-9' : 'sm:col-start-3 sm:col-end-11'}`}
                description={filmData.description}
                countries={filmData.countries}
                filmLength={filmData.filmLength}
                genres={filmData.genres}
                ratingImdb={filmData.ratingImdb}
                ratingKinopoisk={filmData.ratingKinopoisk}
                year={filmData.year}
            />
            <SequelsAndPrequels 
                className="col-start-1 col-end-12 mt-2"
                sequelsAndPrequels={filmData.sequelsAndPrequels} 
            />
        </div>
    </>
}

export const FilmPageWrapper = () => {
    const { id } = useParams();

    return <FilmPage key={id} />
}