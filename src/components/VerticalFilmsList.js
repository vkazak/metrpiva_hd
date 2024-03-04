import { ScrollShadow } from "@nextui-org/scroll-shadow";
import { FilmCard } from "./FilmCard";

export const VerticalFilmsList = ({ className, title, list }) => {
    return <div className={className}>
        <h3 className="text sm:text-xl">{title}</h3>
        <ScrollShadow className="flex px-2 py-6 gap-5 sm:gap-10" orientation="horizontal">
            {list.map(filmState => (
                <FilmCard
                    className="w-[150px] sm:w-[200px]"
                    key={filmState.id}
                    id={filmState.id}
                    poster={filmState.poster}
                    name={filmState.name}
                    seasonEpisode={filmState.episode ? 
                        `Сезон ${filmState.season} | Серия ${filmState.episode}` : null }
                />
            ))}
        </ScrollShadow>
    </div>
}