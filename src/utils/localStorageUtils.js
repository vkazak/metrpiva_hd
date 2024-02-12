const EXPIRE_MS = 86400000; // 1 day

export const saveFilmDataToStorage = (data) => {
    localStorage.setItem(`film_${data.kinopoiskId}`, JSON.stringify({
        ...data,
        timestamp: Date.now()
    }));
}

export const getFilmDataFromStorage = (id) => {
    const dataString = localStorage.getItem(`film_${id}`);
    const data = dataString ? JSON.parse(dataString) : null;

    if (data?.timestamp && Date.now() - data.timestamp < EXPIRE_MS) {
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
    const MAX_ITEMS_INCLUDE = 20;

    return getAllSavedStates()
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, MAX_ITEMS_INCLUDE);
}