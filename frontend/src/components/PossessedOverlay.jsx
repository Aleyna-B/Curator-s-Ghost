"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function PossessedOverlay() {
    const [isActive, setIsActive] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const [currentRiddle, setCurrentRiddle] = useState(null);
    const [message, setMessage] = useState("");
    const [glitch, setGlitch] = useState(false);

    const searchParams = useSearchParams();
    const artworkId = searchParams.get("id") || searchParams.get("artworkId"); // Handle different param names if any
    const title = searchParams.get("title");

    // Check game status on mount
    useEffect(() => {
        const storedSession = localStorage.getItem("ghost_game_session");
        if (storedSession) {
            setIsActive(true);
            setSessionId(storedSession);
            document.body.classList.add("mode-possessed");
        }
    }, []);

    // Start Game
    const startGame = async () => {
        try {
            const res = await fetch("http://localhost:8080/api/game/start", { method: "POST" });
            const data = await res.json();

            setSessionId(data.sessionId);
            setCurrentRiddle(data.quest);
            setMessage(data.message);
            setIsActive(true);

            localStorage.setItem("ghost_game_session", data.sessionId);
            document.body.classList.add("mode-possessed");

            // Play creepy sound if possible
            playTypewriterSound();
        } catch (e) {
            console.error("Failed to summon the game", e);
        }
    };

    // Quit Game
    const quitGame = () => {
        setIsActive(false);
        setSessionId(null);
        setCurrentRiddle(null);
        localStorage.removeItem("ghost_game_session");
        document.body.classList.remove("mode-possessed");
    };

    // Check Current Location (when looking at artwork)
    useEffect(() => {
        if (!isActive || !sessionId || !title) return;

        const checkProgress = async () => {
            try {
                const res = await fetch("http://localhost:8080/api/game/check", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ sessionId, artworkTitle: title, artworkId })
                });
                const data = await res.json();

                if (data.success) {
                    setGlitch(true);
                    setMessage(data.message);
                    setTimeout(() => setGlitch(false), 2000);

                    if (data.completed) {
                        setCurrentRiddle("YOU ARE FREE.");
                        setTimeout(quitGame, 5000);
                    } else {
                        setCurrentRiddle(data.nextRiddle);
                    }
                }
            } catch (e) {
                console.error("Game check failed", e);
            }
        };

        // Delay slightly to let user settle
        const timer = setTimeout(checkProgress, 2000);
        return () => clearTimeout(timer);
    }, [sessionId, title, isActive]);

    const playTypewriterSound = () => {
        // Placeholder for sound effect
    };

    if (!isActive) {
        return (
            <button
                onClick={startGame}
                className="fixed bottom-4 left-4 z-50 text-xs text-red-900 opacity-50 hover:opacity-100 hover:text-red-600 font-serif transition-all"
                title="Do not click..."
            >
                † Accept Fate
            </button>
        );
    }

    return (
        <>
            <div className="blood-vignette" />

            <div className={`possessed-overlay ${glitch ? 'glitch-text' : ''}`} data-text="THE PACT">
                <h3>CURRENT OBJECTIVE</h3>
                <p className="mb-4 text-white/90">{currentRiddle || "Listen to the voices..."}</p>

                {message && (
                    <div className="text-sm italic text-red-400 border-t border-red-900/50 pt-2 mt-2 anime-fade-in">
                        {message}
                    </div>
                )}

                <button
                    onClick={quitGame}
                    className="mt-6 text-xs text-red-800 hover:text-red-500 uppercase tracking-widest"
                >
                    Break Pact
                </button>
            </div>
        </>
    );
}
