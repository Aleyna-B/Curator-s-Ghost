"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense, use } from "react";
import Image from "next/image";
import GhostPanel from "@/components/GhostPanel";
import LoadingSpinner from "@/components/LoadingSpinner";

function ArtworkContent({ params }) {
    const { id } = use(params);
    const searchParams = useSearchParams();
    const vibe = searchParams.get("vibe") || "victorian_critic";

    const [artwork, setArtwork] = useState(null);
    const [critique, setCritique] = useState(null);
    const [quickInsight, setQuickInsight] = useState(null);
    const [isLoadingArtwork, setIsLoadingArtwork] = useState(true);
    const [isLoadingCritique, setIsLoadingCritique] = useState(false);
    const [error, setError] = useState(null);

    // Fetch artwork details
    useEffect(() => {
        const fetchArtwork = async () => {
            setIsLoadingArtwork(true);

            try {
                const response = await fetch(`http://localhost:8080/api/artworks/${id}`);
                if (!response.ok) throw new Error("Failed to fetch artwork");
                const data = await response.json();
                setArtwork(data);
            } catch (err) {
                // Mock artwork for demo
                setArtwork({
                    id,
                    title: "Starry Night",
                    artist: "Vincent van Gogh",
                    year: "1889",
                    imageUrl: "/placeholder-art.jpg",
                    description: "A swirling night sky over a village, one of the most recognized paintings in Western art.",
                });
            } finally {
                setIsLoadingArtwork(false);
            }
        };

        fetchArtwork();
    }, [id]);

    // Fetch ghost critique
    useEffect(() => {
        if (!artwork) return;

        const fetchCritique = async () => {
            setIsLoadingCritique(true);
            setCritique(null);
            setQuickInsight(null);
            setError(null);

            try {
                const response = await fetch("http://localhost:8080/api/critique", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        artworkId: id,
                        persona: vibe,
                    }),
                });

                if (!response.ok) throw new Error("The ghost remains silent...");

                const data = await response.json();
                setCritique(data.critique);
                setQuickInsight(data.quickInsight);
            } catch (err) {
                setError(err.message);
                // Mock critique for demo
                setCritique(
                    "Ah, this piece speaks to the very essence of human longing. The swirling heavens above seem to dance with an otherworldly energy, while the humble village below slumbers in blissful ignorance. One cannot help but feel the artist's tormented soul reaching out through each brushstroke, yearning for connection with the infinite cosmos."
                );
                setQuickInsight(
                    "A masterwork of post-impressionism that captures the boundary between earthly existence and celestial wonder."
                );
            } finally {
                setIsLoadingCritique(false);
            }
        };

        fetchCritique();
    }, [artwork, id, vibe]);

    if (isLoadingArtwork) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" message="Retrieving the artwork..." />
            </div>
        );
    }

    return (
        <div className="min-h-screen px-4 py-8 md:py-12">
            {/* Back Navigation */}
            <nav className="max-w-7xl mx-auto mb-8">
                <a
                    href={`/gallery?vibe=${vibe}`}
                    className="inline-flex items-center text-secondary hover:text-primary transition-colors"
                >
                    ← Back to Gallery
                </a>
            </nav>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                    {/* Artwork Image */}
                    <section className="reveal">
                        <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-muted/30 border border-ghost">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={artwork?.imageUrl || "/placeholder-art.jpg"}
                                alt={artwork?.title || "Artwork"}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Artwork Info */}
                        <div className="mt-6 space-y-2">
                            <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
                                {artwork?.title}
                            </h1>
                            <p className="text-primary text-xl">
                                {artwork?.artist}
                            </p>
                            <p className="text-secondary">
                                {artwork?.year}
                            </p>
                            {artwork?.description && (
                                <p className="text-secondary/80 text-sm mt-4 italic">
                                    {artwork.description}
                                </p>
                            )}
                        </div>
                    </section>

                    {/* Ghost Panel */}
                    <section className="reveal" style={{ animationDelay: "200ms" }}>
                        <GhostPanel
                            critique={critique}
                            quickInsight={quickInsight}
                            isLoading={isLoadingCritique}
                            error={error}
                        />

                        {/* Chat with Ghost Button */}
                        <a
                            href={`/chat?persona=${vibe}&artworkId=${id}&title=${encodeURIComponent(artwork?.title || '')}&artist=${encodeURIComponent(artwork?.artist || '')}`}
                            className="chat-with-ghost-btn"
                        >
                            💬 Chat with the Ghost
                        </a>
                    </section>
                </div>
            </div>
        </div>
    );
}

export default function ArtworkPage({ params }) {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" message="Opening the vault..." />
            </div>
        }>
            <ArtworkContent params={params} />
        </Suspense>
    );
}
