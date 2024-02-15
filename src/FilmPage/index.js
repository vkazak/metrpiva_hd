import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useFilm } from "../hooks/useFilm"
import { useParams } from "react-router-dom";
import { Button, Image, ScrollShadow, Select, SelectItem, Tab, Tabs } from "@nextui-org/react";
import { getFilmStateFromStorage } from "../utils/localStorageUtils";
import { LoaderOverlay } from "../Loader";

const TranslatorsSelect = ({
    className = '',
    translators = [],
    selected,
    onSelect
}) => {
    const translatorsExtenedList = useMemo(() => {
        if (selected == '') {
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
        label="Перевод" 
        variant="bordered"
        selectionMode="single"
        radius="sm"
        selectedKeys={new Set([selected])}
        onChange={onChange}
    >
        {
            translatorsExtenedList.map(translator => (<SelectItem key={translator.id}>
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
    }, [seasons]);

    return <ScrollShadow orientation="horizontal" className={"relative " + className} ref={seasonsRef}>
        <Tabs variant="underlined" onSelectionChange={onSelect} selectedKey={selectedSeason} className="mb-2">
            {seasons?.map(season => (
                <Tab key={season.id} title={season.name} />
            ))}
        </Tabs>
    </ScrollShadow>
} 

const EpisodesList = ({ className, episodes, selectedEpisode, onSelect }) => {
    const episodesListRef = useRef();
    const selectedEpisodeRef = useRef();
    
    useEffect(() => {
        if (selectedEpisode && episodesListRef.current && selectedEpisodeRef.current) {
            episodesListRef.current.scrollTop = selectedEpisodeRef.current.offsetTop - episodesListRef.current.offsetHeight / 2 + selectedEpisodeRef.current.offsetHeight / 2;
        }
    }, [selectedEpisode]);

    return <ScrollShadow hideScrollBar className={"relative scroll-smooth " + className} ref={episodesListRef}>
        {episodes?.map(episode => (
            <Button 
                key={episode.id} 
                ref={selectedEpisode == episode.id ? selectedEpisodeRef : null}
                variant={selectedEpisode == episode.id ? 'shadow' : 'light'}
                radius='none'
                fullWidth
                onClick={() => onSelect(episode.id)}
            >
                {episode.name}
            </Button>
        ))}
    </ScrollShadow>
}

const usePageTitle = (filmName) => {
    useEffect(() => {
        if (filmName) {
            document.title = `${filmName} - Metrpiva HD`;
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
        <p>Год: </p><p>{year}</p>
        <p>Страна: </p><p>{countries?.map(({ country }) => country)?.join(', ')}</p>
        <p>Продолжительность: </p><p>{filmLength} минут</p>
        <p>Жанр: </p><p>{genres?.map(({ genre }) => genre)?.join(', ')}</p>
        <p>Рейтинг: </p><p>КП: {ratingKinopoisk} &nbsp;&nbsp;&nbsp; IMDB: {ratingImdb}</p>
        <p className="col-span-2">{description}</p>
    </div>
}

export const FilmPage = () => {
    const { id } = useParams();
    const {
        isFilmDataLoading,
        isBalancerFilmDataLoading,
        isPlaying,
        nameRu,
        nameOriginal,
        posterUrl,
        description,
        countries,
        filmLength,
        genres,
        ratingImdb,
        ratingKinopoisk,
        year,
        translators,
        selectedTranslator,
        updateSelectedTranslator,
        seasons,
        episodes,
        selectedSeasonEpisode,
        updateSelectedSeasonEpisode,
    } = useFilm(id, getFilmStateFromStorage(id));

    usePageTitle(nameRu || nameOriginal);

    const [openSeason, setOpenSeason] = useState(seasons?.[0]?.id || null);

    useEffect(() => {
        if (selectedSeasonEpisode?.season) {
            setOpenSeason(selectedSeasonEpisode.season);
        } else {
            setOpenSeason(seasons?.[0]?.id || null);
        }
    }, [selectedSeasonEpisode, seasons]);

    return <>
        <div className="fixed z-0 top-0 left-0">
            <Image 
                src={posterUrl}
                radius="none"
                className="data-[loaded=true]:opacity-30 z-0"
            />
            <div className="absolute h-full w-full top-0 z-1 bg-gradient-to-l from-black"></div>
        </div>
        <div className="mt-6 relative z-10 grid grid-cols-12 gap-4">
            {isFilmDataLoading && <LoaderOverlay />}
            <div className="col-start-1 col-end-13 sm:col-end-9">
                <h1 className="text-3xl">{nameRu}</h1>
                <h3 className="opacity-70">{nameOriginal}</h3>
            </div>
            <TranslatorsSelect 
                className="col-start-1 col-end-9 sm:col-end-4"
                translators={translators} 
                selected={selectedTranslator} 
                onSelect={updateSelectedTranslator}
            />
            {!!seasons?.length && <SeasonsList 
                className="col-start-1 col-end-13 sm:col-end-9"
                seasons={seasons}
                selectedSeason={openSeason}
                onSelect={setOpenSeason}
            />}
            {selectedSeasonEpisode?.episode && 
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
            {isBalancerFilmDataLoading && document.getElementById('oframeplayer') &&
                createPortal(
                    <LoaderOverlay />,
                    document.getElementById('oframeplayer')
                )
            }
            <div 
                id="player" 
                className="shadow-lg rounded-xl ring-2 ring-white/5 overflow-hidden
                    col-start-1 col-end-13 sm:col-end-9"
            />
            {!!episodes?.[openSeason] && <div className="shadow-lg max-h-48 sm:h-0 sm:min-h-full 
                col-start-1 sm:col-start-9 col-end-13">
                <EpisodesList 
                    className="h-full"
                    episodes={episodes?.[openSeason]}
                    selectedEpisode={openSeason == selectedSeasonEpisode?.season ? selectedSeasonEpisode?.episode : null}
                    onSelect={(episode) => updateSelectedSeasonEpisode(openSeason, episode)}
                />
            </div>}
            <AdditionalInfo 
                className="col-start-1 col-end-12 sm:col-end-9 mt-4 sm:mt-8"
                description={description}
                countries={countries}
                filmLength={filmLength}
                genres={genres}
                ratingImdb={ratingImdb}
                ratingKinopoisk={ratingKinopoisk}
                year={year}
            />
        </div>
    </>
}