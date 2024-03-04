import { useMemo } from "react"
import { getLastSavedStates } from "../utils/localStorageUtils"
import { ScrollShadow } from "@nextui-org/scroll-shadow";
import { FilmCard } from "./FilmCard";

export const ContinueWatching = () => {
    const lastStates = useMemo(() => getLastSavedStates() || [], []);

    return !!lastStates?.length && <div>
        <h3 className="px-2 text sm:text-xl">Продолжить: </h3>
        <ScrollShadow className="flex py-6 px-2 gap-5 sm:gap-10" orientation="horizontal">
            {lastStates.map(filmState => (
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