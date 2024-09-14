import { useMemo } from "react"
import { getLastSavedStates } from "../utils/localStorageUtils"
import { VerticalFilmsList } from "../components/VerticalFilmsList";

export const ContinueWatching = () => {
    const lastStates = useMemo(() => getLastSavedStates() || [], []);

    return !!lastStates?.length && <VerticalFilmsList 
        title=""
        list={lastStates}
    />
}