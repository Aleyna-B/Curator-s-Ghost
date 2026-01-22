"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import ArtworkCard from "@/components/ArtworkCard";
import LoadingSpinner from "@/components/LoadingSpinner";

function GalleryContent() {
    const searchParams = useSearchParams();
    const vibe = searchParams.get("vibe") || "renaissance";

    const [artworks, setArtworks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch artworks based on vibe
    useEffect(() => {
        const fetchArtworks = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const response = await fetch(`http://localhost:8080/api/artworks?vibe=${vibe}`);

                if (!response.ok) {
                    throw new Error("Failed to fetch artworks");
                }

                const data = await response.json();
                setArtworks(data.artworks || []);
            } catch (err) {
                setError(err.message);
                // Mock data for demo purposes when API is unavailable
                setArtworks([
                    { id: "1", title: "Starry Night", artist: "Vincent van Gogh", year: "1889", imageUrl: "/placeholder-art.jpg" },
                    { id: "2", title: "Water Lilies", artist: "Claude Monet", year: "1906", imageUrl: "/placeholder-art.jpg" },
                    { id: "3", title: "The Birth of Venus", artist: "Sandro Botticelli", year: "1485", imageUrl: "/placeholder-art.jpg" },
                    { id: "4", title: "Girl with a Pearl Earring", artist: "Johannes Vermeer", year: "1665", imageUrl: "/placeholder-art.jpg" },
                    { id: "5", title: "The Persistence of Memory", artist: "Salvador Dalí", year: "1931", imageUrl: "/placeholder-art.jpg" },
                    { id: "6", title: "The Great Wave", artist: "Katsushika Hokusai", year: "1831", imageUrl: "/placeholder-art.jpg" },
                ]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchArtworks();
    }, [vibe]);

    const vibeLabels = {
        renaissance: "Renaissance",
        impressionism: "Impressionism",
        victorian_critic: "Victorian Era",
    };



    return (
        <div className="min-h-screen px-4 py-12 md:py-16">
            {/* Header */}
            <header className="text-center mb-12">
                <a
                    href="/"
                    className="inline-block text-secondary hover:text-primary transition-colors mb-4"
                >
                    ← Back to Guides
                </a>

                <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-2">
                    {vibeLabels[vibe] || "Gallery"}
                </h1>
                <p className="text-secondary italic">
                    Select an artwork to hear the ghost's critique
                </p>
                <div className="mt-4 w-24 h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent mx-auto" />
            </header>

            {/* Loading State */}
            {isLoading && (
                <div className="flex justify-center py-20">
                    <LoadingSpinner size="lg" message="Summoning the collection..." />
                </div>
            )}

            {/* Error State (shows mock data) */}
            {error && !isLoading && (
                <div className="text-center mb-8 p-4 bg-ghost/20 rounded-lg max-w-md mx-auto">
                    <p className="text-secondary/70 text-sm italic">
                        Demo mode: showing sample artworks
                    </p>
                </div>
            )}

            {/* Artwork Grid */}
            {!isLoading && artworks.length > 0 && (
                <section className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {artworks.map((artwork, index) => (
                            <div
                                key={artwork.id}
                                className="reveal"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <ArtworkCard artwork={artwork} vibe={vibe} />
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Empty State */}
            {!isLoading && artworks.length === 0 && !error && (
                <div className="text-center py-20">
                    <p className="text-secondary text-lg">
                        The gallery appears empty... The spirits are silent.
                    </p>
                </div>
            )}
        </div>
    );
}

export default function GalleryPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" message="Opening the gallery..." />
            </div>
        }>
            <GalleryContent />
        </Suspense>
    );
}
