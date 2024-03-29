import { AnimatedDiv } from "./AnimatedDiv"

export const Loader = () => {
    return <img className='max-h-28' src='/loader2.svg' alt='Loader' />
}

export const LoaderOverlay = () => {
    return <AnimatedDiv 
        className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm"
        key="loader"
    >
        <Loader />
    </AnimatedDiv>
}