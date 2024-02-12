import { useMemo } from "react"
import { getLastSavedStates } from "../utils/localStorageUtils"
import { ScrollShadow } from "@nextui-org/scroll-shadow";
import { FilmCard } from "./FilmCard";

export const ContinueWatching = () => {
    const lastStates = useMemo(() => getLastSavedStates() || [], []);

    console.log(lastStates);

    return !!lastStates?.length && <div>
        <h3 className="mt-6 text-2xl px-2">Продолжить: </h3>
        <ScrollShadow className="flex gap-10 py-6 px-2" orientation="horizontal">
            {lastStates.map(filmState => (
                <FilmCard
                    className="min-w-[200px]"
                    key={filmState.id}
                    id={filmState.id}
                    poster={filmState.poster}
                    name={filmState.name}
                />
            ))}
        </ScrollShadow>
    </div>
}