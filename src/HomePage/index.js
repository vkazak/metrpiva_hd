import { Input } from "@nextui-org/react"
import { useState } from "react"
import { useSearch } from "../hooks/useSearch";
import { FilmCard } from "./FilmCard";
import { ContinueWatching } from "./ContinueWatching";

export const HomePage = () => {
    const [searchValue, setSearchValue] = useState("");

    const { 
        searchInProgress,
        searchResults,
        searchTerm,
        updateSearchResults
    } = useSearch();

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            updateSearchResults(searchValue);
        }
    }

    return <div className="home">
        <ContinueWatching />
        <div className="flex items-center justify-center my-10">
            <Input 
                type="search"
                radius="full"
                placeholder="Поиск"
                className="max-w-screen-md p-6"
                onValueChange={setSearchValue}
                onKeyDown={handleKeyDown}
            />
        </div>
        <div className="grid grid-cols-5 gap-10">
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