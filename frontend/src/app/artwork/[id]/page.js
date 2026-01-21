"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense, use, useRef } from "react";
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
    const [isSpectral, setIsSpectral] = useState(false);
    const [spectralSecrets, setSpectralSecrets] = useState([]);

    // Keyboard listener for Spectral Vision
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.code === 'Space' && !e.repeat) {
                e.preventDefault(); // Prevent scrolling
                setIsSpectral(prev => !prev); // TOGGLE MODE
            }
            if (e.code === 'Escape') {
                setIsSpectral(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    // Add/remove body class for spectral mode
    useEffect(() => {
        if (isSpectral) {
            document.body.classList.add('spectral-mode-active');
        } else {
            document.body.classList.remove('spectral-mode-active');
        }
    }, [isSpectral]);

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

    const hasFetchedRef = useRef(false);

    // Fetch ghost critique
    useEffect(() => {
        if (!artwork) return;
        if (hasFetchedRef.current) return; // STRICT MODE FIX: Prevent double fetch

        const fetchCritique = async () => {
            hasFetchedRef.current = true; // Mark as fetched immediately
            setIsLoadingCritique(true);
            setCritique(null);
            setQuickInsight(null);
            setSpectralSecrets([]); // Reset secrets
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

                // Set AI-generated secrets (or fallback to empty if missing)
                if (data.secrets && Array.isArray(data.secrets)) {
                    setSpectralSecrets(data.secrets);
                }

            } catch (err) {
                setError(err.message);
                // Mock critique for demo
                setCritique(
                    "Ah, this piece speaks to the very essence of human longing. The swirling heavens above seem to dance with an otherworldly energy..."
                );
                setQuickInsight(
                    "A masterwork of post-impressionism."
                );
                const randPos = () => Math.floor(Math.random() * 60) + 20 + '%';
                setSpectralSecrets([
                    { top: randPos(), left: randPos(), text: "A hidden signature lies beneath the varnish." },
                    { top: randPos(), left: randPos(), text: "X-ray reveals a previous composition here." },
                    { top: randPos(), left: randPos(), text: "The light source here defies natural laws." }
                ]);
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
        <div className={`min-h-screen px-4 py-8 md:py-12 ${isSpectral ? 'spectral-vision' : ''}`}>
            {/* Spectral Overlay */}
            <div className={`spectral-overlay ${isSpectral ? 'active' : ''}`} aria-hidden="true" />

            {/* Back Navigation */}
            <nav className="max-w-7xl mx-auto mb-8 relative z-20">
                <a
                    href={`/gallery?vibe=${vibe}`}
                    className="inline-flex items-center text-secondary hover:text-primary transition-colors"
                >
                    ← Back to Gallery
                </a>
            </nav>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                    {/* Artwork Image */}
                    <section className="reveal">
                        <div className="artwork-image-container relative aspect-[3/4] rounded-xl overflow-hidden bg-muted/30 border border-ghost">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={artwork?.imageUrl || "/placeholder-art.jpg"}
                                alt={artwork?.title || "Artwork"}
                                className="w-full h-full object-cover"
                            />
                            <div className="spectral-hint">
                                PRESS SPACE TO ENTER THE VOID
                            </div>
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

                    {/* SPECTRAL LIGHTBOX (Hidden unless active) */}
                    {isSpectral && (
                        <div className="spectral-lightbox-container">
                            <div className="spectral-lightbox-image-wrapper">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={artwork?.imageUrl || "/placeholder-art.jpg"}
                                    alt="Spectral View"
                                    className="spectral-image"
                                />

                                {/* Hotspots on the lightbox image */}
                                {spectralSecrets.map((secret, index) => (
                                    <div
                                        key={index}
                                        className="ghost-hotspot"
                                        style={{ top: secret.top, left: secret.left }}
                                    >
                                        <div className="ghost-tooltip">{secret.text}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="spectral-lightbox-hint">
                                PRESS SPACE OR ESC TO RETURN
                            </div>
                        </div>
                    )}

                    {/* Ghost Panel */}
                    <section className="reveal" style={{ animationDelay: "200ms" }}>
                        <GhostPanel
                            critique={critique}
                            quickInsight={quickInsight}
                            isLoading={isLoadingCritique}
                            error={error}
                        />

                        {/* Chat Buttons */}
                        <div className="flex flex-col gap-3 mt-6">
                            <a
                                href={`/chat?persona=${vibe}&artworkId=${id}&title=${encodeURIComponent(artwork?.title || '')}&artist=${encodeURIComponent(artwork?.artist || '')}`}
                                className="chat-with-ghost-btn"
                            >
                                💬 Chat with the Ghost Curator
                            </a>

                            <a
                                href={`/chat?mode=subject&persona=${vibe}&artworkId=${id}&title=${encodeURIComponent(artwork?.title || '')}&artist=${encodeURIComponent(artwork?.artist || '')}`}
                                className="chat-with-ghost-btn bg-transparent border-2 border-primary/50 text-white hover:bg-primary/10 hover:border-primary transition-all shadow-[0_0_15px_rgba(100,200,255,0.1)] hover:shadow-[0_0_25px_rgba(100,200,255,0.3)]"
                            >
                                👁️ Speak to the Painting
                            </a>
                        </div>
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
