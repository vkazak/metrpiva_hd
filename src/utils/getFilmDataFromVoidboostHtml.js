import { VOIDBOOST_URL } from "../Constants";
import { decodeUrl } from "./decodeUrlVoidboost";

const getEncodedFile = (html) => {
    return html.match(/'#2.+?'/s)?.[0]?.replaceAll("'", "") || null;
}

const getThumbnails = (html) => {
    const thumbnailsUrl = html.match(/'\/thumbnails.+?'/)?.[0]?.replaceAll("'", "") || null;
    
    return thumbnailsUrl ? VOIDBOOST_URL + thumbnailsUrl : null;
}

const getTranslators = (html) => {
    const dom = new DOMParser().parseFromString(html, 'text/html');
    const translatorsSelect = dom.querySelector('#translator-name');
    const translators = [...(translatorsSelect?.children || [])]
        ?.map(option => ({
            id: option.getAttribute('value'),
            token: option.getAttribute('data-token'),
            name: option.innerText
        }))
        ?.filter(translator => translator.token);

    return translators;
}

const getSeasons = (html) => {
    const dom = new DOMParser().parseFromString(html, 'text/html');

    const seasonsSelect = dom.querySelector('#season-number');
    const seasons = [...(seasonsSelect?.children || [])]
        ?.map(option => ({
            id: option.getAttribute('value'),
            name: option.innerText
        }));

    return seasons;
}

const getEpisodes = (html) => {
    const episodesText = html.match(/var seasons_episodes = {.*?}/)?.[0]
        ?.replace('var seasons_episodes = ', '');
    const episodes = episodesText ? JSON.parse(episodesText) : {};

    for (const season in episodes) {
        episodes[season] = episodes[season].map(episode => ({
            id: episode,
            name: `Серия ${episode}`
        }))
    }

    return episodes;
}

const getType = (html) => {
    return html.match(/ type = '.+?'/)?.[0]
        ?.replaceAll(" type = ", "")
        ?.replaceAll("'", "") || null;
}

export const getFilmDataFromVoidboostHtml = (html) => {
    const decodedStream = decodeUrl(getEncodedFile(html));

    return {
        stream: decodedStream,
        thumbnails: getThumbnails(html),
        translators: getTranslators(html),
        seasons: getSeasons(html),
        episodes: getEpisodes(html),
        balancerType: getType(html),
    };
}