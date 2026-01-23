"use client";

import { useState, useEffect } from "react";
import LoadingSpinner from "./LoadingSpinner";

export default function GhostPanel({ critique, quickInsight, isLoading, error }) {
    const [displayedText, setDisplayedText] = useState("");
    const [isTyping, setIsTyping] = useState(false);

    // Typewriter effect
    useEffect(() => {
        if (!critique || isLoading) {
            setDisplayedText("");
            return;
        }

        setIsTyping(true);
        setDisplayedText("");

        let index = 0;
        const intervalId = setInterval(() => {
            if (index < critique.length) {
                setDisplayedText(prev => prev + critique.charAt(index));//use charAt
                index++;
            } else {
                setIsTyping(false);
                clearInterval(intervalId);
            }
        }, 30);

        return () => clearInterval(intervalId);
    }, [critique, isLoading]);

    return (
        <aside className="ghost-panel rounded-xl p-6 md:p-8 space-y-6">
            {/* Header */}
            <div className="text-center border-b border-ghost pb-4">
                <h2 className="font-serif text-2xl font-bold text-primary tracking-wide">
                    The Curator Speaks
                </h2>
                <div className="mt-2 w-16 h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent mx-auto" />
            </div>

            {/* Content Area */}
            <div className="min-h-[200px] flex items-start justify-center">
                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <LoadingSpinner message="The ghost is contemplating..." />
                    </div>
                ) : error ? (
                    <div className="text-center py-8">
                        <p className="text-red-400/80 italic">
                            The spirit has retreated into the shadows...
                        </p>
                        <p className="text-secondary text-sm mt-2">{error}</p>
                    </div>
                ) : (
                    <div className="prose prose-invert max-w-none">
                        <p className={`text-foreground/90 text-lg leading-relaxed font-serif italic ${isTyping ? 'typewriter' : ''}`}>
                            "{critique}"
                            {/* not using the displayedText state here to avoid typewriter effect */}
                        </p>
                    </div>
                )}
            </div>

            {/* Quick Insight Card */}
            {quickInsight && !isLoading && !error && (
                <div className="reveal bg-ghost/50 rounded-lg p-4 border border-primary/10">
                    <h3 className="text-sm font-semibold text-primary/80 uppercase tracking-wider mb-2">
                        Quick Insight
                    </h3>
                    <p className="text-secondary text-sm leading-relaxed">
                        {quickInsight}
                    </p>
                </div>
            )}
        </aside>
    );
}
