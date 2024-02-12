import React from "react"
import { Card, CardFooter } from "@nextui-org/card";
import { Image } from "@nextui-org/image";
import { Link } from "react-router-dom";

export const FilmCard = ({ 
    className = '',
    id, 
    poster, 
    name, 
    rating, 
    year 
}) => {
    let ratingColor;

    if (+rating >= 7) {
        ratingColor = 'bg-green-700';
    } else if (+rating < 5) {
        ratingColor = 'bg-red-700';
    } else {
        ratingColor = 'bg-zinc-600';
    }

    return <Link to={`/watch/${id}`}>
        <Card className={"shadow hover:scale-105 " + className}>
            { rating && rating != 'null' && <div className={`absolute top-0 right-4 ${ratingColor} z-20 shadow-lg`}>
                <p className="p-2 text-lg">{rating}</p>
            </div> }
            <Image 
                className="w-96 h-auto object-cover aspect-[2/3]"
                src={poster}
            />
            <CardFooter className="absolute flex-col items-start z-10 bottom-0">
                <p className="text-lg">{name}</p>
                <p className="text-sm opacity-80">{year}</p>
            </CardFooter>
        </Card>
    </Link>
}