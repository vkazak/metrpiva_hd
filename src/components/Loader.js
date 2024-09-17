import { AnimatedDiv } from "./AnimatedDiv"

export const Loader = () => {
    return <img className='max-h-28' src='/loader2.svg' alt='Loader' />
}

export const LoaderOverlay = () => {
    return <AnimatedDiv 
        className="absolute top-0 bottom-0 left-0 right-0 bg-[#0D0D0F]/50 flex items-center justify-center z-50 backdrop-blur-sm"
        key="loader"
    >
        <Loader />
    </AnimatedDiv>
}