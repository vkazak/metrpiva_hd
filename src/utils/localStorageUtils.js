const EXPIRE_MS = 86400000; // 1 day

const saveFilmData = (data) => {
    localStorage.setItem(`film_${filmId}`, JSON.stringify({
        ...data,
        timestamp: Date.now()
    }));
}

const getFilmData = (id) => {
    const dataString = localStorage.getItem(`film_${id}`);
    const data = dataString ? JSON.parse(dataString) : null;

    if (data?.timestamp && Date.now() - data.timestamp < EXPIRE_MS) {
        return data
    } else {
        return null;
    }
}

const updateFilmState = ({
    id,
    season,
    episode,
    time
}) => {
    const stateString = localStorage.getItem(`state_${id}`);
    const state = stateString ? JSON.parse(stateString) : {};
    
    const newState = {
        season: season ? season : state.season,
        episode: episode ? episode : state.episode,
        time: time ? time : state.time,
        timestamp: Date.now()
    }

    localStorage.setItem(`state_${id}`, JSON.stringify(newState));
}

const getFilmState = (id) => {
    const stateString = localStorage.getItem(`state_${id}`);
    const state = stateString ? JSON.parse(stateString) : null;

    return state;
}