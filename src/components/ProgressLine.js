import { useMemo } from "react"

export const ProgressLine = ({ className, progress }) => {
    const widthPercent = useMemo(() => {
        return `${(progress * 100).toFixed(2)}%`;
    }, [progress]);

    return <div 
        className={`h-1 bg-white/40 ${className}`}
        style={{ width: widthPercent }}
    />
}