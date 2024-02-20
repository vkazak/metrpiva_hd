import { Input } from "@nextui-org/react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useSearch } from "../hooks/useSearch";
import { FilmCard } from "./FilmCard";
import { ContinueWatching } from "./ContinueWatching";
import { LoaderOverlay } from "../Loader";
import { hitPageLoad } from "../utils/ym";

export const HomePage = () => {
    const [searchValue, setSearchValue] = useState("");

    const { 
        searchInProgress,
        searchResults,
        searchTerm,
        updateSearchResults
    } = useSearch();

    useEffect(() => {
        hitPageLoad(document.location.pathname, document.title);
    }, []);

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            updateSearchResults(searchValue);
        }
    }

    const SearchInfoLabel = useCallback(() => {
        if (!searchTerm) return <></>;

        if (searchResults?.length > 0) {
            return <p className="my-5">
                Результаты поиска по запросу "{searchTerm}":
            </p>
        } else {
            return <p className="text-center mt-10">
                По запросу "{searchTerm}" ничего не найдено :(
            </p>
        }
    }, [searchResults, searchTerm]);

    useEffect(() => {
        if (searchResults?.length) {
            document.getElementById('search').scrollIntoView({ behavior: 'smooth' });
        }
    }, [searchResults]);

    return <div className="home flex flex-col h-full">
        <ContinueWatching />
        <div id="search" className="flex items-center justify-center mt-10">
            <Input 
                type="search"
                radius="full"
                placeholder="Поиск"
                className="max-w-screen-md p-6"
                onValueChange={setSearchValue}
                onKeyDown={handleKeyDown}
            />
        </div>
        <SearchInfoLabel />
        <div className="grid relative min-h-28 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 xl:gap-10">
            { searchInProgress && <LoaderOverlay /> }
            {
                searchResults.map(film => (
                    <FilmCard 
                        key={film.filmId}
                        id={film.filmId} 
                        name={film.nameRu || film.nameEn} 
                        poster={film.posterUrlPreview || film.posterUrl}
                        rating={film.rating}
                        year={film.year}
                    />
                ))
            }
        </div>
    </div>
}