import React from "react"
import { Card } from "@nextui-org/card";
import { Image } from "@nextui-org/image";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export const FilmCard = ({ 
    className = '',
    id, 
    poster, 
    name, 
    rating, 
    year,
    seasonEpisode,
}) => {
    let ratingColor;

    if (+rating >= 7) {
        ratingColor = 'bg-green-700';
    } else if (+rating < 5) {
        ratingColor = 'bg-red-700';
    } else {
        ratingColor = 'bg-zinc-600';
    }

    return <Link className="block h-fit" to={`/watch/${id}`}>
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            whileHover={{ opacity: 1, scale: 1.05 }} 
            whileTap={{ opacity: 1, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }} 
            className={className}
        >
            <Card className="shadow">
                { rating && rating !== 'null' && <div className={`absolute top-0 right-4 ${ratingColor} z-20 shadow-lg`}>
                    <p className="p-2 text-lg">{rating}</p>
                </div> }
                <Image 
                    className="w-96 h-auto object-cover aspect-[2/3]"
                    src={poster}
                />
            </Card>
            <p className="mt-2 text-sm">{name}</p>
            {!!year && <p className="opacity-80 text-xs">{year}</p>}
            {!!seasonEpisode && <p className="opacity-80 text-xs">{seasonEpisode}</p>}
        </motion.div>
    </Link>
}