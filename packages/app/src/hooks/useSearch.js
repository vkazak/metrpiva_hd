import { useState } from "react";
import { KP_WORKER_URL } from "../Constants";

export const useSearchApi = () => {
    const getFilmsByTerm = async (term) => {
        const searchResponse = await fetch(`${KP_WORKER_URL}/search?q=${term}`);
        
        return searchResponse.json();
    }

    return {
        getFilmsByTerm
    }
}

export const useSearch = () => {
    const { getFilmsByTerm } = useSearchApi();
    const [searchTerm, setSearchTerm] = useState("");
    const [searchInProgress, setSearchInProgress] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [isError, setIsError] = useState(false);

    
    const updateSearchResults = async (term) => {
        setSearchInProgress(true);
        setIsError(false);

        try {
            const filmsResponse = await getFilmsByTerm(term);
            setSearchResults(filmsResponse.films);
            setSearchTerm(filmsResponse.keyword);
            setIsError(!filmsResponse.films)
        } catch (err) {
            console.error(err);
            setIsError(true);
        } finally {
            setSearchInProgress(false);
        }
    }

    return {
        isError,
        searchTerm,
        searchInProgress,
        searchResults,
        updateSearchResults
    }
}