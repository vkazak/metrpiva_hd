import { useCallback, useEffect, useState } from "react";

export const usePlayer = () => {
    const [isPlayerReady, setIsPlayerReady] = useState(false);
    const [player, setPlayer] = useState(null);

    useEffect(() => {
        const script = document.createElement('script');
        script.src = '/playerjs.js';
        script.async = true;
        document.body.appendChild(script);
        script.addEventListener('load', () => {
            const createdPlayer = new window.Playerjs({ id: "player" });
            setPlayer(createdPlayer);
            window.player = createdPlayer;
            setIsPlayerReady(true);
        })

        return () => {
            document.body.removeChild(script);
        }
    }, []);

    const setStream = useCallback(({ stream, thumbnails, cuid }) => {
        player?.api("preload", stream);
        if (cuid) {
            player?.api("cuid", cuid);
        }
        if (thumbnails) {
            player?.api("thumbnails", thumbnails);
        }
    }, [player]);

    const startPlaying = useCallback(() => {
        player?.api("play");
    }, [player]);

    const setTime = useCallback((time) => {
        player?.api("seek", time);
    }, [player]);

    const getTime = useCallback(() => {
        return player?.api("time");
    }, [player]);

    const getIsPlaying = useCallback(() => {
        return player?.api("playing");
    }, [player])

    return {
        isPlayerReady,
        setStream,
        startPlaying,
        setTime,
        getTime,
        getIsPlaying,
    }
}