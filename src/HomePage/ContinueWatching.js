import { useMemo } from "react"
import { getLastSavedStates } from "../utils/localStorageUtils"
import { ScrollShadow } from "@nextui-org/scroll-shadow";
import { FilmCard } from "./FilmCard";

export const ContinueWatching = () => {
    const lastStates = useMemo(() => getLastSavedStates() || [], []);

    return !!lastStates?.length && <div>
        <h3 className="text-2xl px-2">Продолжить: </h3>
        <ScrollShadow className="flex gap-10 py-6 px-2" orientation="horizontal">
            {lastStates.map(filmState => (
                <FilmCard
                    className="w-[200px]"
                    key={filmState.id}
                    id={filmState.id}
                    poster={filmState.poster}
                    name={filmState.name}
                />
            ))}
        </ScrollShadow>
    </div>
}