import { useCallback, useEffect, useMemo, useState } from "react";
import { useFilm } from "../hooks/useFilm"
import { useParams } from "react-router-dom";
import { Accordion, AccordionItem, Button, Image, ScrollShadow, Select, SelectItem, Tab, Tabs } from "@nextui-org/react";

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
    </div>

    /*return <div>
        <ScrollShadow hideScrollBar orientation="horizontal">
            <Tabs variant="underlined" onSelectionChange={setOpenSeason} selectedKey={openSeason}>
                {seasons.map(season => (
                    <Tab key={season.id} title={season.name} />
                ))}
            </Tabs>
        </ScrollShadow>
        <ScrollShadow hideScrollBar orientation="horizontal" className="flex no-wrap gap-2 mt-4">
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

export const FilmPage = () => {
    const { id } = useParams();
    const {
        isFilmDataLoading,
        nameRu,
        nameOriginal,
        posterUrl,
        stream,
        thumbnails,
        translators,
        selectedTranslator,
        updateSelectedTranslator,
        seasons,
        episodes,
        selectedSeasonEpisode,
        updateSelectedSeasonEpisode,
    } = useFilm(id);

    const onEpisodeSelect = useCallback(async (season, episode) => {
        await updateSelectedSeasonEpisode(season, episode);
        //startPlaying()
    }, [updateSelectedSeasonEpisode]);

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
            <div 
                id="player" 
                className="shadow-lg rounded-xl ring-2 ring-white/5 overflow-hidden
                    col-start-1 col-end-9"
            />
            <div className="player-selectors col-start-9 col-end-13">
                <EpisodesAccordeon 
                    seasons={seasons}
                    episodes={episodes}
                    currentSeasonEpisode={selectedSeasonEpisode}
                    onSelect={onEpisodeSelect}
                />
            </div>
        </div>
    </>
}