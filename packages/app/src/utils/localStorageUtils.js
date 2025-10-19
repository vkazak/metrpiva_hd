const DAY_MS = 86400000; // 1 day in ms
const FILM_CACHE_EXPIRE_MS = 3 * DAY_MS; 
const CLEAR_STORAGE_PERIOD = 3 * DAY_MS;

const MAX_ITEMS_IN_CONTINUE = 20;

export const saveFilmDataToStorage = (data) => {
    localStorage.setItem(`film_${data.kinopoiskId}`, JSON.stringify({
        ...data,
        timestamp: Date.now()
    }));
}

export const getFilmDataFromStorage = (id) => {
    const dataString = localStorage.getItem(`film_${id}`);
    const data = dataString ? JSON.parse(dataString) : null;

    if (data?.timestamp && Date.now() - data.timestamp < FILM_CACHE_EXPIRE_MS) {
        return data
    } else {
        return null;
    }
}

export const updateFilmStateInStorage = ({
    id,
    poster,
    name,
    translatorId,
    season,
    episode,
    time
}) => {
    const stateString = localStorage.getItem(`state_${id}`);
    const state = stateString ? JSON.parse(stateString) : {};
    
    const newState = {
        id,
        poster: poster ? poster : state.poster,
        name: name ? name : state.name,
        translatorId: translatorId ? translatorId : state.translatorId,
        season: season ? season : state.season,
        episode: episode ? episode : state.episode,
        time: time ? time : state.time,
        timestamp: Date.now()
    }

    localStorage.setItem(`state_${id}`, JSON.stringify(newState));
}

export const getFilmStateFromStorage = (id) => {
    const stateString = localStorage.getItem(`state_${id}`);
    const state = stateString ? JSON.parse(stateString) : null;

    return state;
}

export const getAllSavedStates = () => {
    return Object.entries(localStorage)
        .filter(([key]) => key.startsWith('state_'))
        .map(([__, value]) => JSON.parse(value));
}

export const getLastSavedStates = () => {
    return getAllSavedStates()
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, MAX_ITEMS_IN_CONTINUE);
}

export const validateAndClearLocalStorage = () => {
    const lastClearTimestamp = localStorage.getItem('last_clear');
    const timestampNow = Date.now();
    const isClearingNeeded = !lastClearTimestamp || (timestampNow - lastClearTimestamp > CLEAR_STORAGE_PERIOD);

    if (isClearingNeeded) {
        const filmKeys = [], stateKeys = [], pljsKeys = [];

        Object.keys(localStorage)
            .forEach((key) => {
                if (key.startsWith('film_')) {
                    filmKeys.push(key);
                } else if (key.startsWith('state_')) {
                    stateKeys.push(key);
                } else if (key.startsWith('pljsplayfrom_')) {
                    pljsKeys.push(key);
                }
            });
        
        filmKeys.forEach(filmKey => {
            const filmCache = JSON.parse(localStorage.getItem(filmKey));
            if (timestampNow - filmCache.timestamp > FILM_CACHE_EXPIRE_MS) {
                localStorage.removeItem(filmKey);
                console.log(`Film cache cleared for: ${filmCache.kinopoiskId} | ${filmCache.nameRu || filmCache.nameOriginal}`);
            }
        });

        const lastSavedStates = getLastSavedStates();

        const clearPlJsCacheById = (id) => {
            pljsKeys.forEach(pljsKey => {
                if (pljsKey.includes(`cuid-${id}-`)) {
                    localStorage.removeItem(pljsKey);
                }
            })
        }

        stateKeys.forEach(stateKey => {
            const curState = JSON.parse(localStorage.getItem(stateKey));
            if (!lastSavedStates.find(st => st.id === curState.id)) {
                localStorage.removeItem(stateKey);
                clearPlJsCacheById(curState.id);
                console.log(`Film state cleared for:  ${curState.id} | ${curState.name}`);
            }
        });

        localStorage.setItem('last_clear', timestampNow);
    }
}

export const getWatchingProgress = ({ id, season, episode }) => {
    const playerStateString = localStorage.getItem(
        `pljsplayfrom_${window.location.hostname}cuid-${id}-${season ? `s${season}` : ''}-${episode ? `e${episode}` : ''}`
    );

    if (!playerStateString) {
        return 0;
    } else {
        const stateArr = playerStateString.split('--');

        return stateArr[0] / stateArr[1];
    }
}