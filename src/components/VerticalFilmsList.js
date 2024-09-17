import { useRef, useState } from "react";
import { ScrollShadow } from "@nextui-org/scroll-shadow";
import { FilmCard } from "./FilmCard";
import { ChevronRightIcon } from "./icons/ChevronRightIcon";
import { ChevronLeftIcon } from "./icons/ChevronLeftIcon";
import { Button } from "@nextui-org/react";
import { useResizeObserver } from "../hooks/useResizeObserver";

export const VerticalFilmsList = ({ className = '', title, list }) => {
    const listRef = useRef(null);
    const [showChevron, setShowChevron] = useState(true);

    useResizeObserver(() => setShowChevron(listRef.current.offsetWidth < listRef.current.scrollWidth));

    const scrollHorizontally = (mult) => {
        listRef.current.scrollTo({
            left: listRef.current.scrollLeft + mult * listRef.current.clientWidth * 0.9,
            behavior: 'smooth'
        })
    }

    return <div className={`${className}`}>
        <h3 className="text sm:text-xl">{title}</h3>
        <div className="relative">
            <ScrollShadow className="flex py-4" ref={listRef} orientation="horizontal" hideScrollBar>
                {list.map(filmState => (
                    <FilmCard
                        className="w-[12rem] m-2"
                        key={filmState.id}
                        id={filmState.id}
                        poster={filmState.poster}
                        name={filmState.name}
                        seasonEpisode={filmState.episode ? 
                            `Сезон ${filmState.season} | Серия ${filmState.episode}` : null }
                    />
                ))}
            </ScrollShadow>
            {showChevron && <Button className="absolute left-0 top-[9rem] z-20" variant='flat' isIconOnly radius="full" onClick={() => scrollHorizontally(-1)}>
                <ChevronLeftIcon className='w-6 h-6'/>
            </Button>}
            {showChevron && <Button className="absolute right-0 top-[9rem] z-20" variant='flat' isIconOnly radius="full" onClick={() => scrollHorizontally(1)}>
                <ChevronRightIcon className='w-6 h-6'/>
            </Button>}
        </div>
    </div>
}