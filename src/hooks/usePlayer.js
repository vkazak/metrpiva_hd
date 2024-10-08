import { useCallback, useEffect, useState } from "react";

export const usePlayer = () => {
    const [isPlayerReady, setIsPlayerReady] = useState(false);
    const [player, setPlayer] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        const script = document.createElement('script');
        script.src = '/player-v1.2.0.js';
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

    const addListener = useCallback((type, fn) => {
        document.getElementById('player')?.addEventListener?.(type, fn);
    }, []);

    const removeListener = useCallback((type, fn) => {
        document.getElementById('player')?.removeEventListener?.(type, fn);
    }, []);

    useEffect(() => {
        if (player) {
            addListener('play', () => setIsPlaying(true));
            addListener('pause', () => setIsPlaying(false));
        }
    }, [player, addListener]);

    const setStream = useCallback(({ stream, thumbnails, subtitle, cuid }) => {
        player?.api("preload", stream);
        if (cuid) {
            player?.api("cuid", cuid);
        }
        if (thumbnails) {
            player?.api("thumbnails", thumbnails);
        }
        if (subtitle) {
            player?.api("subtitle", subtitle);
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
    }, [player]);

    return {
        isPlayerReady,
        setStream,
        startPlaying,
        setTime,
        getTime,
        getIsPlaying,
        isPlaying,
        addListener,
        removeListener,
    }
}