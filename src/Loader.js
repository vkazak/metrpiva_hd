export const Loader = () => {
    return <img className='max-h-28' src='/loader.svg' alt='Loader' />
}

export const LoaderOverlay = () => {
    return <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
        <Loader />
    </div>
}