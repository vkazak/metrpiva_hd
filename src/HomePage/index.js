import { Card, CardFooter, Image, Input } from "@nextui-org/react"
import { useState } from "react"
import { useSearch } from "../hooks/useSearch";
import { Link } from "react-router-dom";

const FilmCard = ({ id, poster, name, rating, year }) => {
    let ratingColor;

    if (+rating >= 7) {
        ratingColor = 'bg-green-700';
    } else if (+rating < 5) {
        ratingColor = 'bg-red-700';
    } else {
        ratingColor = 'bg-zinc-600';
    }

    return <Link to={`/watch/${id}`}>
        <Card className="shadow hover:scale-105">
            { rating && rating != 'null' && <div className={`absolute top-0 right-4 ${ratingColor} z-20 shadow-lg`}>
                <p className="p-2 text-lg">{rating}</p>
            </div> }
            <Image 
                className="w-full h-full object-cover"
                src={poster}
            />
            <CardFooter className="absolute flex-col items-start z-10 bottom-0">
                <p className="text-lg">{name}</p>
                <p className="text-sm opacity-80">{year}</p>
            </CardFooter>
        </Card>
    </Link>
}

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
        <div className="flex items-center justify-center mt-[30vh]">
            <Input 
                type="search"
                radius="full"
                placeholder="Поиск"
                classNames={{
                    input: "text-lg font-medium",
                    inputWrapper: "bg-slate-50/75 hover:ring",
                    mainWrapper: "h-fit shadow-lg",
                    innerWrapper: "focus:ring"
                }}
                className="max-w-screen-md p-6"
                onValueChange={setSearchValue}
                onKeyDown={handleKeyDown}
            />
        </div>
        <div className="grid grid-cols-4 gap-10">
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