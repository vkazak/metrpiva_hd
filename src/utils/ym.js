const YMID = 96529825;

export const hitPageLoad = (url, title) => {
    if (window.ym) {
        window.ym(YMID, 'hit', url, {
            params: { title }
        })
    }
}