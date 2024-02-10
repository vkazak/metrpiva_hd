import { useCallback, useEffect, useMemo, useState } from "react";
import { useFilm } from "../hooks/useFilm"
import { useParams } from "react-router-dom";
import { Accordion, AccordionItem, Button, Divider, Image, ScrollShadow, Select, SelectItem, Tab, Tabs } from "@nextui-org/react";
import { getFilmStateFromStorage } from "../utils/localStorageUtils";

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

const EpisodesAccordeon = ({ seasons, episodes, currentSeasonEpisode, onSelect }) => {
    const [openSeason, setOpenSeason] = useState(seasons?.[0]?.id || null);

    useEffect(() => {
        if (currentSeasonEpisode?.season) {
            setOpenSeason(currentSeasonEpisode.season);
        } else {
            setOpenSeason(seasons?.[0]?.id || null);
        }
    }, [currentSeasonEpisode, seasons, episodes]);

    if (!seasons?.length) {
        return null;
    }
    /*
    return <div className="backdrop-blur-sm shadow rounded">
        <Accordion>
            {seasons.map(season => (
                <AccordionItem key={season.id} title={season.name}>
                    <div className="">
                        {episodes[season.id]?.map(episode => (
                            <Button 
                                key={episode.id} 
                                variant={currentSeasonEpisode?.season == season.id && currentSeasonEpisode?.episode == episode.id ? 'shadow' : 'light'}
                                radius='none'
                                fullWidth
                                onClick={() => onSelect(season.id, episode.id)}
                            >
                                {episode.name}
                            </Button>
                        ))}
                    </div>
                </AccordionItem>
            ))}
        </Accordion>
         <ScrollShadow orientation="horizontal" className="flex no-wrap gap-1 mt-4 ring p-4" scroll>
            {episodes[openSeason]?.map(episode => (
                <Button 
                    key={episode.id} 
                    variant={currentSeasonEpisode?.season == openSeason && currentSeasonEpisode?.episode == episode.id ? 'shadow' : 'bordered'}
                    radius='none'
                    className="p-4 width"
                    onClick={() => onSelect(openSeason, episode.id)}
                >
                    {episode.name}
                </Button>
            ))}
        </ScrollShadow>
    </div>*/

}

const SeasonsList = ({ className, seasons, selectedSeason, onSelect }) => {
    return <ScrollShadow orientation="horizontal" className={className}>
        <Tabs variant="underlined" onSelectionChange={onSelect} selectedKey={selectedSeason} className="mb-2">
            {seasons?.map(season => (
                <Tab key={season.id} title={season.name} />
            ))}
        </Tabs>
    </ScrollShadow>
}

const EpisodesList = ({ className, episodes, selectedEpisode, onSelect }) => {
    return <ScrollShadow hideScrollBar className={className}>
        {episodes?.map(episode => (
            <Button 
                key={episode.id} 
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

    const onEpisodeSelect = useCallback(async (season, episode) => {
        updateSelectedSeasonEpisode(season, episode);
    }, [updateSelectedSeasonEpisode]);

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
            <div className="col-start-1 col-end-10">
                <h1 className="text-3xl">{nameRu}</h1>
                <h3 className="opacity-70">{nameOriginal}</h3>
            </div>
            <TranslatorsSelect 
                className="col-start-1 col-end-4"
                translators={translators} 
                selected={selectedTranslator} 
                onSelect={updateSelectedTranslator}
            />
            {!!seasons?.length && <SeasonsList 
                className="col-start-1 col-end-9"
                seasons={seasons}
                selectedSeason={openSeason}
                onSelect={setOpenSeason}
            />}
            <div 
                id="player" 
                className="shadow-lg rounded-xl ring-2 ring-white/5 overflow-hidden
                    col-start-1 col-end-9"
            />
            {!!episodes?.[openSeason] && <div className="shadow-lg col-start-9 col-end-13 h-0 min-h-full">
                <EpisodesList 
                    className="h-full"
                    episodes={episodes?.[openSeason]}
                    selectedEpisode={openSeason == selectedSeasonEpisode?.season ? selectedSeasonEpisode?.episode : null}
                    onSelect={(episode) => updateSelectedSeasonEpisode(openSeason, episode)}
                />
            </div>}
            <AdditionalInfo 
                className="col-start-1 col-end-9 mt-8"
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