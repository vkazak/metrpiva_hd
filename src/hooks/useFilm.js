import { useCallback, useEffect, useMemo, useState } from "react";
import { KP_WORKER_URL, VOIDBOOST_URL } from "../Constants";
import { getFilmDataFromVoidboostHtml } from "../utils/getFilmDataFromVoidboostHtml";
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
        const balancerResponse = await fetch(`${VOIDBOOST_URL}/embed/${id}`);
        const balancerHtml = await balancerResponse.text();

        return getFilmDataFromVoidboostHtml(balancerHtml);
    }, []);

    const getBalancerFilmData = useCallback(async ({ id, token, type, season, episode }) => {
        let queryUrl;
        
        if (token) {
            queryUrl = new URL(`${VOIDBOOST_URL}/${type}/${token}/iframe`)
        } else if (id) {
            queryUrl = new URL(`${VOIDBOOST_URL}/embed/${id}`);
        } else  {
            throw new Error("No token or id provided to fetch from Videoboost");
        }   

        if (season) {
            queryUrl.searchParams.set('s', season);
        }
        if (episode) {
            queryUrl.searchParams.set('e', episode);
        }

        const balancerResponse = await fetch(queryUrl.href);
        const balancerHtml = await balancerResponse.text();

        return getFilmDataFromVoidboostHtml(balancerHtml);
    }, []);

    return {
        getFilmData,
        getBalancerInitFilmData,
        getBalancerFilmData
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
    const { getFilmData, getBalancerFilmData } = useFilmApi();
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
    const [isBalancerFilmDataLoading, setIsBalancerFilmDataLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [filmData, setFilmData] = useState({});
    const [balancerData, setBalancerData] = useState({});
    const [selectedTranslator, setSelectedTranslator] = useState('');
    const [selectedSeasonEpisode, setSelectedSeasonEpisode] = useState(null);

    const getTranslatorToken = useCallback((translators, translatorId) => {
        return translators?.find(tr => tr.id === translatorId)?.token || null;
    }, []);
    const checkIfEpisodeExists = useCallback((episodes, season, episode) => {
        return !!episodes?.[season]?.find(ep => ep.id === episode);
    }, []);

    useEffect(() => {
        const fetchFilmData = async () => {
            setIsFilmDataLoading(true);
            try {
                setFilmData(await getFilmData(id));
            } catch (err) {
                console.error(err);
                setIsError(true);
            } finally {
                setIsFilmDataLoading(false);
            }
        };

        if (id && filmData?.kinopoiskId !== +id) {
            fetchFilmData();
        }
    }, [id, getFilmData, filmData]);

    // This useEffect is responsible for init loading of film data from voidboost
    useEffect(() => {
        const fetchBalancerData = async () => {
            setIsError(false);
            setIsBalancerFilmDataLoading(true);
            try {
                let balancerDataResponse = await getBalancerFilmData({ id });
                const filmInitState = {
                    ...getFirstSeasonEpisode(balancerDataResponse.seasons, balancerDataResponse.episodes),
                    ...(initState || {})
                };

                if (filmInitState.translatorId) {
                    setSelectedTranslator(filmInitState.translatorId);
                }
                if (filmInitState.season) {
                    setSelectedSeasonEpisode({ season: +filmInitState.season, episode: +filmInitState.episode });
                }

                const translatorToken = getTranslatorToken(balancerDataResponse.translators, filmInitState.translatorId);

                balancerDataResponse = await getBalancerFilmData({
                    id,
                    token: translatorToken,
                    type: balancerDataResponse.balancerType,
                    season: filmInitState.season,
                    episode: filmInitState.episode
                });

                setBalancerData(balancerDataResponse);
                updateFilmStateInStorage({ id, season: filmInitState.season, episode: filmInitState.episode });

                setStream({ 
                    stream: balancerDataResponse.stream, 
                    thumbnails: balancerDataResponse.thumbnails,
                    cuid: makeCUID(id, filmInitState.season, filmInitState.episode)
                });
            } catch (err) {
                console.error(err);
                setIsError(true);
            } finally {
                setIsBalancerFilmDataLoading(false);
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
        getBalancerFilmData,
        getTranslatorToken,
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
        setIsBalancerFilmDataLoading(true);
        try {
            const translatorToken = getTranslatorToken(balancerData.translators, translatorId);
            let balancerDataNew = await getBalancerFilmData({ 
                id,
                token: translatorToken, 
                type: balancerData.balancerType
            });

            const hasSeasons = balancerDataNew?.seasons?.length;
            let seasonEpisodeWasLoaded = null;
            // If new translator has current episode loading this
            const containsCurrentEpisode = checkIfEpisodeExists(balancerDataNew.episodes, selectedSeasonEpisode?.season, selectedSeasonEpisode?.episode);
            if (containsCurrentEpisode) {
                balancerDataNew = await getBalancerFilmData({
                    id,
                    token: translatorToken, 
                    type: balancerDataNew.balancerType,
                    season: selectedSeasonEpisode.season,
                    episode: selectedSeasonEpisode.episode 
                });
                seasonEpisodeWasLoaded = selectedSeasonEpisode;
            } else if (hasSeasons) {
                const firstSeasonEpisode = getFirstSeasonEpisode(balancerDataNew.seasons, balancerDataNew.episodes);
                balancerDataNew = await getBalancerFilmData({
                    id,
                    token: translatorToken, 
                    type: balancerDataNew.balancerType,
                    season: firstSeasonEpisode.season,
                    episode: firstSeasonEpisode.episode 
                });
                seasonEpisodeWasLoaded = firstSeasonEpisode;
            }
            setBalancerData(balancerDataNew);
            setSelectedTranslator(translatorId);
            updateFilmStateInStorage({ 
                id, 
                translatorId, 
                season: seasonEpisodeWasLoaded?.season, 
                episode: seasonEpisodeWasLoaded?.episode 
            });
    
            const currentPlayTime = getTime();
            const isPlaying = getIsPlaying();

            setSelectedSeasonEpisode(seasonEpisodeWasLoaded);

            setStream({
                stream: balancerDataNew.stream, 
                thumbnails: balancerDataNew.thumbnails
            });
            if (containsCurrentEpisode || !hasSeasons) {
                setTime(currentPlayTime);
            }
            if ((containsCurrentEpisode || !hasSeasons) && isPlaying) {
                startPlaying();
            }
        } catch (err) {
            console.error(err);
            setIsError(true);
        } finally {
            setIsBalancerFilmDataLoading(false);
        }
    }, [
        id, 
        selectedSeasonEpisode, 
        balancerData, 
        checkIfEpisodeExists,
        getBalancerFilmData,
        setStream,
        getIsPlaying,
        getTime,
        getTranslatorToken,
        setTime,
        startPlaying
    ]);

    const updateSelectedSeasonEpisode = useCallback(async (season, episode) => {
        setIsBalancerFilmDataLoading(true);
        try {
            const translatorToken = getTranslatorToken(balancerData.translators, selectedTranslator);
            let balancerDataNew = await getBalancerFilmData({ 
                id,
                token: translatorToken, 
                type: balancerData.balancerType,
                season,
                episode
            });
            setBalancerData(balancerDataNew);
            setSelectedSeasonEpisode({ season, episode });
            updateFilmStateInStorage({ id, season, episode });
            setStream({
                stream: balancerDataNew.stream, 
                thumbnails: balancerDataNew.thumbnails,
                cuid: makeCUID(id, season, episode)
            });
        } catch (err) {
            console.error(err);
            setIsError(true);
        } finally {
            setIsBalancerFilmDataLoading(false);
        }
    }, [
        id, 
        selectedTranslator, 
        balancerData,
        getBalancerFilmData,
        getTranslatorToken,
        setStream
    ]);

    // Watching for 'end' event from player to switch episode to next if possible.
    useEffect(() => {
        const loadAndStartNextEpisodeIfExists = async () => {
            const nextEpisodeInSeasonExists = checkIfEpisodeExists(balancerData.episodes, selectedSeasonEpisode?.season, selectedSeasonEpisode?.episode + 1);

            if (nextEpisodeInSeasonExists) {
                await updateSelectedSeasonEpisode(selectedSeasonEpisode.season, selectedSeasonEpisode.episode + 1);
                setTimeout(startPlaying, 500);
            }
        }
                
        addListener('end', loadAndStartNextEpisodeIfExists);

        return () => removeListener('end', loadAndStartNextEpisodeIfExists);
    }, [
        balancerData, 
        selectedSeasonEpisode, 
        updateSelectedSeasonEpisode, 
        startPlaying,
        addListener,
        removeListener,
        checkIfEpisodeExists,
    ]);

    const episodes = useMemo(() => {
        // collecting episode data from balancer and kp api together
       const preparedEpisodes = structuredClone(balancerData.episodes);
       
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
    }, [filmData.episodes, balancerData.episodes]);

    return {
        isFilmDataLoading,
        isBalancerFilmDataLoading,
        isError,
        isPlaying,
        filmData,
        balancerData,
        selectedTranslator,
        updateSelectedTranslator,
        episodes,
        selectedSeasonEpisode,
        updateSelectedSeasonEpisode
    }
}