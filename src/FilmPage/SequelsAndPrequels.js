import { VerticalFilmsList } from "../components/VerticalFilmsList"

export const SequelsAndPrequels = ({ className, sequelsAndPrequels }) => {
    return !!sequelsAndPrequels?.length && <VerticalFilmsList
        className={className}
        title="Смотрите также: "
        list={sequelsAndPrequels.map(({ filmId, nameRu, nameOriginal, posterUrlPreview }) => 
            ({ id: filmId, name: nameRu || nameOriginal, poster: posterUrlPreview }))}
    />
}