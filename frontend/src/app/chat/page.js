"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";

function ChatContent() {
    const searchParams = useSearchParams();
    const persona = searchParams.get("persona") || "victorian_critic";
    const mode = searchParams.get("mode") || "curator";
    const artworkId = searchParams.get("artworkId");
    const artworkTitle = searchParams.get("title");
    const artworkArtist = searchParams.get("artist");

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const messagesEndRef = useRef(null);

    // TTS States
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [voices, setVoices] = useState([]);

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

    // Load TTS Voices & Cleanup
    useEffect(() => {
        const loadVoices = () => {
            // Check if window is defined (client-side)
            if (typeof window !== "undefined" && window.speechSynthesis) {
                const available = window.speechSynthesis.getVoices();
                setVoices(available);
            }
        };

        loadVoices();

        if (typeof window !== "undefined" && window.speechSynthesis) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }

        // Cleanup: Stop speaking explicitly when unmounting
        return () => {
            if (typeof window !== "undefined" && window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    // Speak Text Function
    const speakText = (text, currentPersona, currentMode) => {
        if (typeof window === "undefined" || !window.speechSynthesis) return;

        window.speechSynthesis.cancel(); // Stop conflicting audio

        const utterance = new SpeechSynthesisUtterance(text);

        // Select Voice
        const selectedVoice = voices.find(v => v.name.includes("Google UK English Male"))
            || voices.find(v => v.name.includes("Male"))
            || voices[0];

        // Voice Modulation based on Persona/Mode
        if (currentMode === 'subject') {
            utterance.pitch = 0.5; // Very deep, ghostly
            utterance.rate = 0.85; // Slow and deliberate
        } else if (currentPersona === 'renaissance') {
            utterance.pitch = 1.0;
            utterance.rate = 0.9; // Poetic
        } else if (currentPersona === 'victorian_critic') {
            utterance.pitch = 0.8;
            utterance.rate = 1.0; // Stern/Serious
        } else {
            utterance.pitch = 1.0;
            utterance.rate = 1.0;
        }

        if (selectedVoice) utterance.voice = selectedVoice;
        window.speechSynthesis.speak(utterance);
    };

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Auto-Speak Watcher
    useEffect(() => {
        const lastMsg = messages[messages.length - 1];
        if (isSpeaking && lastMsg && lastMsg.role === 'assistant') {
            speakText(lastMsg.content, persona, mode);
        }
    }, [messages, isSpeaking, persona, mode]);

    // Initial Greeting
    useEffect(() => {
        let greeting = "";
        if (mode === 'subject') {
            greeting = `(A voice echoes from within the frame of "${artworkTitle || 'the artwork'}") ... Who disturbs my eternal rest? Speak.`;
        } else {
            greeting = artworkTitle
                ? `Ah, I see you wish to discuss "${artworkTitle}". A fine choice. What would you like to know?`
                : "Welcome, wanderer. I am the spirit of this gallery. What mysteries shall we explore?";
        }
        setMessages([{ role: "assistant", content: greeting }]);
    }, [artworkTitle, mode]);

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
                    mode,
                    artworkContext: artworkTitle ? {
                        id: artworkId,
                        title: artworkTitle,
                        artist: artworkArtist
                    } : null
                })
            });

            const data = await response.json();
            if (data.sessionId) setSessionId(data.sessionId);
            setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: "assistant", content: "The spirits are disturbed... Please try again." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const headerTitle = mode === 'subject'
        ? `The Spirit of "${artworkTitle || 'Unknown'}"`
        : `Conversing with ${personaNames[persona]}`;

    const headerEmoji = mode === 'subject' ? '👻' : personaEmojis[persona];

    return (
        <div className="chat-container h-screen flex flex-col relative overflow-hidden bg-black">
            <div className="hero-background absolute inset-0 z-0" aria-hidden="true" />
            <div className="hero-overlay absolute inset-0 z-0" aria-hidden="true" />

            {/* Header */}
            <header className="chat-header flex items-center justify-between px-6 py-4 relative z-10 border-b border-white/10 bg-black/40 backdrop-blur-md">
                <div className="flex items-center gap-4">
                    {/* Explicitly Cancel Audio on Back Click */}
                    <Link
                        href={artworkId ? `/artwork/${artworkId}?vibe=${persona}` : "/select"}
                        className="back-link text-white/70 hover:text-white transition-colors"
                        onClick={() => {
                            if (typeof window !== "undefined" && window.speechSynthesis) {
                                window.speechSynthesis.cancel();
                            }
                        }}
                    >
                        ← Back
                    </Link>
                    <div className="chat-title flex items-center gap-3">
                        <span className="text-3xl">{headerEmoji}</span>
                        <div>
                            <h1 className="font-serif text-xl text-cream">{headerTitle}</h1>
                            {artworkTitle && mode !== 'subject' && (
                                <p className="text-cream-muted text-sm">On: {artworkTitle}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Audio Toggle */}
                <button
                    onClick={() => {
                        const newSpeakingState = !isSpeaking;
                        setIsSpeaking(newSpeakingState);
                        if (!newSpeakingState && typeof window !== 'undefined') {
                            window.speechSynthesis.cancel(); // Immediate silence if toggled off
                        }
                    }}
                    className={`p-3 rounded-full border transition-all ${isSpeaking ? 'bg-primary/20 border-primary text-primary shadow-[0_0_15px_rgba(100,200,255,0.3)]' : 'border-secondary/30 text-secondary hover:bg-secondary/10'}`}
                    title={isSpeaking ? "Mute Spirits" : "Summon Voice"}
                >
                    {isSpeaking ? "🔊" : "🔇"}
                </button>
            </header>

            {/* Messages */}
            <div className="messages-container flex-1 overflow-y-auto p-4 space-y-4 relative z-10 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                {messages.map((msg, i) => (
                    <div key={i} className={`message flex gap-3 max-w-[85%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}>
                        {msg.role === "assistant" && (
                            <button
                                onClick={() => {
                                    speakText(msg.content, persona, mode);
                                    setIsSpeaking(true);
                                }}
                                className="message-avatar text-2xl hover:scale-110 transition-transform cursor-pointer self-start mt-1"
                                title="Replay Voice"
                            >
                                {mode === 'subject' ? '👁️' : '👻'}
                            </button>
                        )}

                        <div className={`message-content p-4 rounded-xl ${msg.role === "user" ? "bg-primary/20 text-cream" : "bg-black/60 border border-secondary/30 text-cream/90 backdrop-blur-sm"}`}>
                            <p>{msg.content}</p>
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="message flex gap-3 mr-auto max-w-[85%]">
                        <span className="message-avatar text-2xl self-start mt-1">👻</span>
                        <div className="message-content p-4 rounded-xl bg-black/60 border border-secondary/30 backdrop-blur-sm flex items-center gap-1 h-12">
                            <span className="w-2 h-2 bg-cream/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                            <span className="w-2 h-2 bg-cream/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                            <span className="w-2 h-2 bg-cream/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} className="chat-input-form p-4 bg-black/80 border-t border-white/10 relative z-10 flex gap-3 backdrop-blur-md">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Whisper to the void..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-cream placeholder:text-white/30 focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all font-sans"
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/50 px-6 py-2 rounded-lg font-serif transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_10px_rgba(100,200,255,0.2)]"
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
            <div className="min-h-screen bg-black flex items-center justify-center">
                <p className="text-cream text-xl font-serif animate-pulse opacity-70">Summoning the spirits...</p>
            </div>
        }>
            <ChatContent />
        </Suspense>
    );
}
