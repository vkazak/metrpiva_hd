import { useEffect, useRef } from "react";

export const useResizeObserver = (callback) => {
    const observerRef = useRef(null);

    useEffect(() => {
        observerRef.current = new ResizeObserver(callback);
        observerRef.current.observe(document.body);

        return () => {
            observerRef.current.unobserve(document.body);
        }
    }, [callback]);
}