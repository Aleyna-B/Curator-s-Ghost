import { useEffect, useRef } from "react";

export default function DebateArena({
    debateMessages,
    isTyping,
    typingSpeaker,
    isLoading,
    onExit
}) {
    const messagesEndRef = useRef(null);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [debateMessages, isTyping]);

    return (
        <div className="chat-container h-screen flex flex-col relative overflow-hidden bg-black">
            <header className="chat-header flex items-center justify-between px-6 py-4 relative z-10 border-b border-white/10 bg-black/40 backdrop-blur-md">
                <button onClick={onExit} className="text-white hover:text-red-500 transition-colors uppercase text-sm tracking-wider">
                    Exit Chaos
                </button>
                <h1 className="text-xl font-serif text-white tracking-widest">SPECTRAL CONFLICT</h1>
                <div className="w-8"></div>
            </header>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-white/20">
                {debateMessages.map((msg, i) => (
                    <div
                        key={i}
                        className={`flex ${msg.speaker === 'lorenzo' ? 'justify-start' : 'justify-end'}`}
                    >
                        <div className={`max-w-[80%] p-4 rounded-lg animate-fade-in ${msg.speaker === 'lorenzo'
                            ? 'bg-amber-900/30 border border-amber-500/30 text-amber-200'
                            : 'bg-red-900/30 border border-red-500/30 text-red-200'
                            }`}>
                            <div className="text-xs uppercase tracking-wider mb-2 opacity-70 flex items-center gap-2">
                                {msg.speaker === 'lorenzo' ? 'LORENZO' : 'EDMUND'}
                            </div>
                            <p className="font-serif leading-relaxed text-sm whitespace-pre-wrap">{msg.text}</p>
                        </div>
                    </div>
                ))}

                {/* TYPING INDICATOR */}
                {isTyping && (
                    <div className={`flex ${typingSpeaker === 'lorenzo' ? 'justify-start' : 'justify-end'} animate-pulse`}>
                        <div className={`px-4 py-2 rounded-lg text-xs tracking-wider flex items-center gap-2 ${typingSpeaker === 'lorenzo' ? 'text-amber-400 bg-amber-900/20' : 'text-red-400 bg-red-900/20'
                            }`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce"></span>
                            <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce delay-100"></span>
                            <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce delay-200"></span>
                            {typingSpeaker === 'lorenzo' ? 'Lorenzo is composing...' : 'Edmund is judging...'}
                        </div>
                    </div>
                )}

                {isLoading && (
                    <div className="flex justify-center mt-20">
                        <p className="text-white/40 animate-pulse font-serif tracking-widest text-sm">SUMMONING AGENTS...</p>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
        </div>
    );
}
