"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ChatContent() {
    const searchParams = useSearchParams();
    const persona = searchParams.get("persona") || "victorian_critic";
    const artworkId = searchParams.get("artworkId");
    const artworkTitle = searchParams.get("title");
    const artworkArtist = searchParams.get("artist");

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const messagesEndRef = useRef(null);

    const personaNames = {
        renaissance: "Lorenzo",
        impressionism: "Claude",
        victorian_critic: "Edmund"
    };

    const personaEmojis = {
        renaissance: "🎨",
        impressionism: "🌻",
        victorian_critic: "🕯️"
    };

    // Auto scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Initial greeting
    useEffect(() => {
        const greeting = artworkTitle
            ? `Ah, I see you wish to discuss "${artworkTitle}" by ${artworkArtist}. A fine choice indeed. What would you like to know?`
            : "Welcome, wanderer. I am the spirit of this gallery. What mysteries of art shall we explore together?";

        setMessages([{ role: "assistant", content: greeting }]);
    }, [artworkTitle, artworkArtist]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput("");
        setMessages(prev => [...prev, { role: "user", content: userMessage }]);
        setIsLoading(true);

        try {
            const response = await fetch("http://localhost:8080/api/agent/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sessionId,
                    message: userMessage,
                    persona,
                    artworkContext: artworkTitle ? {
                        id: artworkId,
                        title: artworkTitle,
                        artist: artworkArtist
                    } : null
                })
            });

            const data = await response.json();

            if (data.sessionId) {
                setSessionId(data.sessionId);
            }

            setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
        } catch (error) {
            setMessages(prev => [...prev, {
                role: "assistant",
                content: "The spirits are disturbed... Please try again."
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="chat-container">
            {/* Background */}
            <div className="hero-background" aria-hidden="true" />
            <div className="hero-overlay" aria-hidden="true" />

            {/* Header */}
            <header className="chat-header">
                <a href={artworkId ? `/artwork/${artworkId}?vibe=${persona}` : "/select"} className="back-link">
                    ← Back
                </a>
                <div className="chat-title">
                    <span className="text-3xl">{personaEmojis[persona]}</span>
                    <div>
                        <h1 className="font-serif text-xl text-cream">
                            Conversing with {personaNames[persona]}
                        </h1>
                        {artworkTitle && (
                            <p className="text-cream-muted text-sm">
                                Discussing: {artworkTitle}
                            </p>
                        )}
                    </div>
                </div>
            </header>

            {/* Messages */}
            <div className="messages-container">
                {messages.map((msg, i) => (
                    <div
                        key={i}
                        className={`message ${msg.role === "user" ? "message-user" : "message-ghost"}`}
                    >
                        {msg.role === "assistant" && (
                            <span className="message-avatar">👻</span>
                        )}
                        <div className="message-content">
                            <p>{msg.content}</p>
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="message message-ghost">
                        <span className="message-avatar">👻</span>
                        <div className="message-content typing">
                            <span></span><span></span><span></span>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} className="chat-input-form">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask the ghost..."
                    className="chat-input"
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    className="chat-send-btn"
                    disabled={isLoading || !input.trim()}
                >
                    Send
                </button>
            </form>
        </div>
    );
}

export default function ChatPage() {
    return (
        <Suspense fallback={
            <div className="chat-container flex items-center justify-center">
                <p className="text-cream">Summoning the spirits...</p>
            </div>
        }>
            <ChatContent />
        </Suspense>
    );
}
