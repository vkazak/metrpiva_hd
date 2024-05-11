import { useCallback, useEffect, useMemo, useState } from "react";
import { KP_WORKER_URL, REZKA_WORKER_URL } from "../Constants";
import { usePlayer } from "./usePlayer";
import { getFilmDataFromStorage, saveFilmDataToStorage, updateFilmStateInStorage } from "../utils/localStorageUtils";

const useFilmApi = () => {

    const getFilmData = useCallback(async (id) => {
        if (getFilmDataFromStorage(id)) {
            return getFilmDataFromStorage(id);
        } else {
            const filmResponse = await fetch(`${KP_WORKER_URL}/film?id=${id}`);
            const filmData = await filmResponse.json();
            saveFilmDataToStorage(filmData);

            return filmData;
        }
    }, [])

    const getBalancerInitFilmData = useCallback(async (id) => {
        const response = await  fetch(`${REZKA_WORKER_URL}/info?id=${id}`);
        const responseJson = await response.json();
        if (responseJson.error) {
            throw new Error("Error during getting balancer init film data");
        }
        return responseJson;
    }, []);

    const getBalancerEpisodes = useCallback(async ({ id, translatorId }) => {
        const response = await  fetch(`${REZKA_WORKER_URL}/episodes?id=${id}&translator_id=${translatorId}`);
        const responseJson = await response.json();
        if (responseJson.error) {
            throw new Error("Error during getting balancer episodes");
        }
        return responseJson;
    }, []);

    const getMovieStream = useCallback(async ({ id, translatorId }) => {
        const response = await fetch(`${REZKA_WORKER_URL}/movie-stream?id=${id}&translator_id=${translatorId}`);;
        const responseJson = await response.json();
        if (responseJson.error) {
            throw new Error("Error during getting balancer movie stream");
        }
        return responseJson;
    }, []);

    const getEpisodeStream = useCallback(async ({ id, translatorId, season, episode }) => {
        const response = await fetch(`${REZKA_WORKER_URL}/episode-stream?id=${id}&translator_id=${translatorId}&s=${season}&e=${episode}`);
        const responseJson = await response.json();
        if (responseJson.error) {
            throw new Error("Error during getting balancer episode stream");
        }
        return responseJson;
    }, []);

    return {
        getFilmData,
        getBalancerInitFilmData,
        getBalancerEpisodes,
        getMovieStream,
        getEpisodeStream
    }
}

const getFirstSeasonEpisode = (seasons, episodes) => {
    if (!seasons?.length) {
        return null;
    }
    const firstSeason = seasons[0].id;
    const firstEpisode = episodes[firstSeason][0].id;

    return { season: firstSeason, episode: firstEpisode };
}

const makeCUID = (id, season, episode) => {
    return `cuid-${id}-${season ? 's' + season : ''}-${episode ? 'e' + episode : ''}`;
}

export const useFilm = (id, initState) => {
    const {
        getFilmData,
        getBalancerInitFilmData,
        getBalancerEpisodes,
        getMovieStream,
        getEpisodeStream
    } = useFilmApi();
    const {
        isPlayerReady,
        setStream,
        setTime,
        getTime,
        startPlaying,
        getIsPlaying,
        isPlaying,
        addListener,
        removeListener
    } = usePlayer();

    const [isFilmDataLoading, setIsFilmDataLoading] = useState(true);
    const [isBalancerInitFilmDataLoading, setIsBalancerInitFilmDataLoading] = useState(true);
    const [isEpisodesLoading, setIsEpisodesLoading] = useState(false);
    const [isStreamLoading, setIsStreamLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [filmData, setFilmData] = useState({});
    const [balancerData, setBalancerData] = useState({});
    const [balancerEpisodes, setBalancerEpisodes] = useState({});
    const [streamData, setStreamData] = useState({});
    const [selectedTranslator, setSelectedTranslator] = useState('');
    const [selectedSeasonEpisode, setSelectedSeasonEpisode] = useState(null);

    const checkIfEpisodeExists = useCallback((episodes, season, episode) => {
        return !!episodes?.[season]?.find(ep => ep.id === episode);
    }, []);

    useEffect(() => {
        const fetchFilmData = async () => {
            setIsFilmDataLoading(true);
            try {
                const filmData = await getFilmData(id);
                if (!filmData.kinopoiskId) {
                    throw new Error('Could not fetch film data for provided id');
                }
                setFilmData(filmData);
            } catch (err) {
                console.error(err);
                setIsError(true);
            } finally {
                setIsFilmDataLoading(false);
            }
        };

        if (id && filmData?.kinopoiskId !== +id && !isError) {
            fetchFilmData();
        }
    }, [id, getFilmData, filmData, isError]);

    // This useEffect is responsible for init loading of film data from rezka
    useEffect(() => {
        const fetchBalancerData = async () => {
            setIsError(false);
            try {
                setIsBalancerInitFilmDataLoading(true);
                const balancerInitFilmData = await getBalancerInitFilmData(id);
                setBalancerData(balancerInitFilmData);

                const actualTranslator = initState?.translatorId || balancerInitFilmData.defaultTranslator;
                setSelectedTranslator(actualTranslator);

                let episodesData = null;
                if (balancerInitFilmData.hasSeasons) {
                    setIsEpisodesLoading(true);
                    episodesData = await getBalancerEpisodes({ 
                        id, 
                        translatorId: actualTranslator 
                    });
                    setBalancerEpisodes(episodesData);
                    setIsEpisodesLoading(false);
                }
                setIsBalancerInitFilmDataLoading(false);

                let curStreamData = {};
                let actualSeasonEpisode = {};

                setIsStreamLoading(true);
                if (balancerInitFilmData.hasSeasons) {
                    const firstSeasonEpisode = getFirstSeasonEpisode(episodesData.seasons, episodesData.episodes);
                    actualSeasonEpisode = {
                        season: +(initState?.season || firstSeasonEpisode.season),
                        episode: +(initState?.episode || firstSeasonEpisode.episode),
                    }
                    setSelectedSeasonEpisode(actualSeasonEpisode);
                    updateFilmStateInStorage({ 
                        id, 
                        season: actualSeasonEpisode.season, 
                        episode: actualSeasonEpisode.episode 
                    });
                    
                    curStreamData = await getEpisodeStream({ 
                        id, 
                        translatorId: actualTranslator, 
                        season: actualSeasonEpisode.season,
                        episode: actualSeasonEpisode.episode,
                    })
                } else {
                    curStreamData = await getMovieStream({
                        id,
                        translatorId: actualTranslator
                    })
                }

                setIsStreamLoading(false);
                setStreamData(curStreamData);

                setStream({ 
                    stream: curStreamData.stream, 
                    thumbnails: curStreamData.thumbnails,
                    cuid: makeCUID(id, actualSeasonEpisode.season, actualSeasonEpisode.episode)
                });
            } catch (err) {
                console.error(err);
                setIsError(true);
            } finally {
                setIsBalancerInitFilmDataLoading(false);
                setIsEpisodesLoading(false);
                setIsStreamLoading(false);
            }
        }

        if (id && isPlayerReady) {
            fetchBalancerData();
        }
    }, [
        id, 
        isPlayerReady,
        initState,
        setStream,
        getBalancerInitFilmData,
        getBalancerEpisodes,
        getMovieStream,
        getEpisodeStream,
    ]);

    useEffect(() => {
        if (filmData) {
            updateFilmStateInStorage({ 
                id, 
                poster: filmData.posterUrlPreview, 
                name: filmData.nameRu || filmData.nameOriginal 
            });
        }
    }, [id, filmData]);

    const updateSelectedTranslator = useCallback(async (translatorId) => {
        try {
            let curStreamData = {};
            let actualSeasonEpisode = {};
            let containsCurrentEpisode = false;
            setIsStreamLoading(true);

            if (balancerData.hasSeasons) {
                setIsEpisodesLoading(true);
                const episodesData = await getBalancerEpisodes({ 
                    id, 
                    translatorId 
                });
                setBalancerEpisodes(episodesData);
                setIsEpisodesLoading(false);

                containsCurrentEpisode = checkIfEpisodeExists(episodesData.episodes, selectedSeasonEpisode?.season, selectedSeasonEpisode?.episode);

                if (containsCurrentEpisode) {
                    actualSeasonEpisode = { ...selectedSeasonEpisode };
                } else {
                    actualSeasonEpisode = getFirstSeasonEpisode(episodesData.seasons, episodesData.episodes);
                }

                setSelectedSeasonEpisode(actualSeasonEpisode);
                updateFilmStateInStorage({ 
                    id, 
                    season: actualSeasonEpisode.season, 
                    episode: actualSeasonEpisode.episode 
                });
                
                curStreamData = await getEpisodeStream({
                    id,
                    translatorId,
                    season: actualSeasonEpisode.season,
                    episode: actualSeasonEpisode.episode,
                });
            } else {
                curStreamData = await getMovieStream({
                    id,
                    translatorId
                });
            }
            setIsStreamLoading(false);

            setSelectedTranslator(translatorId);
            updateFilmStateInStorage({ 
                id, 
                translatorId 
            });

            const currentPlayTime = getTime();
            const isPlaying = getIsPlaying();

            setStream({
                stream: curStreamData.stream, 
                thumbnails: curStreamData.thumbnails,
                cuid: makeCUID(id, actualSeasonEpisode.season, actualSeasonEpisode.episode)
            });

            if (containsCurrentEpisode || !balancerData.hasSeasons) {
                setTime(currentPlayTime);
            }
            if ((containsCurrentEpisode || !balancerData.hasSeasons) && isPlaying) {
                startPlaying();
            }
        } catch (err) {
            console.error(err);
            setIsError(true);
        } finally {
            setIsEpisodesLoading(false);
            setIsStreamLoading(false);
        }
    }, [
        id, 
        selectedSeasonEpisode, 
        balancerData, 
        checkIfEpisodeExists,
        getBalancerEpisodes,
        getMovieStream,
        getEpisodeStream,
        setStream,
        getIsPlaying,
        getTime,
        setTime,
        startPlaying
    ]);

    const updateSelectedSeasonEpisode = useCallback(async (season, episode) => {
        setIsStreamLoading(true);
        try {
            const curStreamData = await getEpisodeStream({ 
                id,
                translatorId: selectedTranslator,
                season,
                episode
            });
            
            setSelectedSeasonEpisode({ season, episode });
            updateFilmStateInStorage({ id, season, episode });

            setStream({
                stream: curStreamData.stream, 
                thumbnails: curStreamData.thumbnails,
                cuid: makeCUID(id, season, episode)
            });
        } catch (err) {
            console.error(err);
            setIsError(true);
        } finally {
            setIsStreamLoading(false);
        }
    }, [
        id, 
        selectedTranslator, 
        getEpisodeStream,
        setStream
    ]);

    // Watching for 'end' event from player to switch episode to next if possible.
    useEffect(() => {
        const loadAndStartNextEpisodeIfExists = async () => {
            const nextEpisodeInSeasonExists = checkIfEpisodeExists(balancerEpisodes.episodes, selectedSeasonEpisode?.season, selectedSeasonEpisode?.episode + 1);

            if (nextEpisodeInSeasonExists) {
                await updateSelectedSeasonEpisode(selectedSeasonEpisode.season, selectedSeasonEpisode.episode + 1);
                setTimeout(startPlaying, 500);
            }
        }
                
        addListener('end', loadAndStartNextEpisodeIfExists);

        return () => removeListener('end', loadAndStartNextEpisodeIfExists);
    }, [
        balancerEpisodes, 
        selectedSeasonEpisode, 
        updateSelectedSeasonEpisode, 
        startPlaying,
        addListener,
        removeListener,
        checkIfEpisodeExists,
    ]);

    const episodes = useMemo(() => {
        // collecting episode data from balancer and kp api together
       const preparedEpisodes = structuredClone(balancerEpisodes.episodes);
       
       for (const seasonKey in preparedEpisodes) {
            const currentSeasonEpisodesInfo = filmData.episodes?.items?.find?.(season => season.number === +seasonKey) || {};

            for (const curEpisode of preparedEpisodes[seasonKey]) {
                const curEpisodeInfo = currentSeasonEpisodesInfo.episodes?.find?.(episode => episode.episodeNumber === +curEpisode.id);
                curEpisode.nameRu = curEpisodeInfo?.nameRu;
                curEpisode.nameEn = curEpisodeInfo?.nameEn;
                curEpisode.releaseDate = curEpisodeInfo?.releaseDate;
                curEpisode.synopsis = curEpisodeInfo?.synopsis;
            }
       }

       return preparedEpisodes;
    }, [filmData.episodes, balancerEpisodes.episodes]);

    return {
        isFilmDataLoading,
        isBalancerInitFilmDataLoading,
        isEpisodesLoading,
        isStreamLoading,
        isError,
        isPlaying,
        filmData,
        balancerData,
        balancerEpisodes,
        streamData,
        selectedTranslator,
        updateSelectedTranslator,
        episodes,
        selectedSeasonEpisode,
        updateSelectedSeasonEpisode
    }
}