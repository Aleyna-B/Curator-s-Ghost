import { useState } from "react";

export function useDebateStream() {
    const [isDebating, setIsDebating] = useState(false);
    const [debateMessages, setDebateMessages] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [typingSpeaker, setTypingSpeaker] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const igniteDebate = async (artworkId, artworkTitle, artworkArtist) => {
        setIsDebating(true);
        setIsLoading(true);
        setDebateMessages([]);
        setIsTyping(true);
        setTypingSpeaker("lorenzo"); // First to speak

        try {
            console.log("Igniting streaming debate for:", artworkTitle);

            const response = await fetch("http://localhost:8080/api/agent/debate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    artworkId,
                    artworkTitle,
                    artist: artworkArtist
                })
            });

            if (!response.body) throw new Error("No response body");

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            // Start of stream
            setIsLoading(false);

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split("\n");

                for (const line of lines) {
                    if (line.startsWith("data: ")) {
                        try {
                            const data = JSON.parse(line.slice(6));

                            if (data.done) {
                                setIsTyping(false);
                                setTypingSpeaker(null);
                                break;
                            }

                            if (data.speaker && data.text) {
                                // Important: Set current typing to false to show message
                                setIsTyping(false);
                                setDebateMessages(prev => [...prev, data]);

                                // Prepare typing indicator for next speaker
                                const nextSpeaker = data.speaker === "lorenzo" ? "edmund" : "lorenzo";
                                setTypingSpeaker(nextSpeaker);
                                setIsTyping(true);
                            }
                        } catch (e) {
                            console.warn("Failed to parse SSE data:", e);
                        }
                    }
                }
            }

        } catch (error) {
            console.error(error);
            setIsDebating(false);
            setIsLoading(false);
            setIsTyping(false);
        }
    };

    const exitDebate = () => {
        setIsDebating(false);
        setDebateMessages([]);
    };

    return {
        isDebating,
        debateMessages,
        isTyping,
        typingSpeaker,
        isLoading,
        igniteDebate,
        exitDebate
    };
}
