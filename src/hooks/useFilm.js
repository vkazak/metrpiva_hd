import { useCallback, useEffect, useRef, useState } from "react";
import { KP_WORKER_URL, VOIDBOOST_URL } from "../Constants";
import { getFilmDataFromVoidboostHtml } from "../utils/getFilmDataFromVoidboostHtml";
import { usePlayer } from "./usePlayer";
import { getFilmDataFromStorage, saveFilmDataToStorage } from "../utils/localStorageUtils";

const useFilmApi = () => {

    const getFilmData = async (id) => {
        if (getFilmDataFromStorage(id)) {
            return getFilmDataFromStorage(id);
        } else {
            const filmResponse = await fetch(`${KP_WORKER_URL}/film?id=${id}`);
            const filmData = await filmResponse.json();
            saveFilmDataToStorage(filmData);

            return filmData;
        }
    }

    const getBalancerInitFilmData = async (id) => {
        const balancerResponse = await fetch(`${VOIDBOOST_URL}/embed/${id}`);
        const balancerHtml = await balancerResponse.text();

        return getFilmDataFromVoidboostHtml(balancerHtml);
    }

    const getBalancerFilmData = async ({ id, token, type, season, episode }) => {
        let queryUrl;
        
        if (token) {
            queryUrl = new URL(`${VOIDBOOST_URL}/${type}/${token}/iframe`)
        } else if (id) {
            queryUrl = new URL(`${VOIDBOOST_URL}/embed/${id}`);
        } else  {
            throw "No token or id provided to fetch from Videoboost"
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
    }

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

export const useFilm = (id) => {
    const { getFilmData, getBalancerFilmData } = useFilmApi();
    const {
        isPlayerReady,
        setStream,
        startPlaying
    } = usePlayer();

    const [isFilmDataLoading, setIsFilmDataLoading] = useState(true);
    const [isBalancerFilmDataLoading, setIsBalancerFilmDataLoading] = useState(true);
    const [filmData, setFilmData] = useState({});
    const [balancerData, setBalancerData] = useState({});
    const [selectedTranslator, setSelectedTranslator] = useState('');
    const [selectedSeasonEpisode, setSelectedSeasonEpisode] = useState(null);

    const getTranslatorToken = useCallback((translatorId) => {
        return balancerData.translators?.find(tr => tr.id == translatorId)?.token || null;
    }, [balancerData.translators]);

    useEffect(() => {
        const fetchFilmData = async () => {
            setIsFilmDataLoading(true);
            try {
                setFilmData(await getFilmData(id));
            } catch (err) {
                console.error(err);
            } finally {
                setIsFilmDataLoading(false);
            }
        };

        if (id) {
            fetchFilmData();
        }
    }, [id]);

    // This useEffect is responsible for init loading of film data from voidboost
    useEffect(() => {
        const fetchBalancerData = async () => {
            setIsBalancerFilmDataLoading(true);
            try {
                const balancerDataResponse = await getBalancerFilmData({ id });
                setBalancerData(balancerDataResponse);
                console.log(balancerDataResponse);
                setStream(balancerDataResponse.stream, balancerDataResponse.thumbnails);
            } catch (err) {
                console.error(err);
            } finally {
                setIsBalancerFilmDataLoading(false);
            }
        }

        if (id && isPlayerReady) {
            fetchBalancerData();
        }

    }, [id, isPlayerReady]);

    // This useEffect runs after init voidboost load. To load supposed episode if needed
    useEffect(() => {
        if (balancerData.seasons?.length && !selectedSeasonEpisode) {
            const firstSeasonEpisode = getFirstSeasonEpisode(balancerData.seasons, balancerData.episodes);
            updateSelectedSeasonEpisode(firstSeasonEpisode.season, firstSeasonEpisode.episode);
        }
    }, [balancerData, selectedSeasonEpisode]);

    const updateSelectedTranslator = useCallback(async (translatorId) => {
        setIsBalancerFilmDataLoading(true);
        try {
            const translatorToken = getTranslatorToken(translatorId);
            let balancerDataNew = await getBalancerFilmData({ 
                id,
                token: translatorToken, 
                type: balancerData.balancerType
            });
            // If new translator has current episode loading this
            if (balancerDataNew.episodes?.[selectedSeasonEpisode?.season]?.find(ep => ep.id == selectedSeasonEpisode?.episode)) {
                balancerDataNew = await getBalancerFilmData({
                    id,
                    token: translatorToken, 
                    type: balancerDataNew.balancerType,
                    season: selectedSeasonEpisode.season,
                    episode: selectedSeasonEpisode.episode 
                })
            }
            setBalancerData(balancerDataNew);
            setSelectedTranslator(translatorId);
            setStream(balancerDataNew.stream, balancerDataNew.thumbnails);
            startPlaying();
        } catch (err) {
            console.error(err);
        } finally {
            setIsBalancerFilmDataLoading(false);
        }
    }, [selectedSeasonEpisode, balancerData, setStream]);

    const updateSelectedSeasonEpisode = useCallback(async (season, episode) => {
        setIsBalancerFilmDataLoading(true);
        try {
            const translatorToken = getTranslatorToken(selectedTranslator);
            let balancerDataNew = await getBalancerFilmData({ 
                id,
                token: translatorToken, 
                type: balancerData.balancerType,
                season,
                episode
            });
            setBalancerData(balancerDataNew);
            setSelectedSeasonEpisode({ season, episode });
            setStream(balancerDataNew.stream, balancerDataNew.thumbnails);
        } catch (err) {
            console.error(err);
        } finally {
            setIsBalancerFilmDataLoading(false);
        }
    }, [selectedTranslator, balancerData])

    return {
        isFilmDataLoading,
        isBalancerFilmDataLoading,
        ...filmData,
        ...balancerData,
        selectedTranslator,
        updateSelectedTranslator,
        selectedSeasonEpisode,
        updateSelectedSeasonEpisode
    }
}