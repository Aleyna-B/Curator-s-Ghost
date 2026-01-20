"use client";

import { useRouter } from "next/navigation";

const vibes = [
    {
        id: "renaissance",
        title: "RENAISSANCE",
        line1: "The rebirth of light and shadow.",
        line2: "Whispers of masters.",
        image: "/renaissance.png",
    },
    {
        id: "impressionism",
        title: "IMPRESSIONISM",
        line1: "A fleeting moment reflecting.",
        line2: "Dreams painted in muted light.",
        image: "/impressionism.png",
    },
    {
        id: "victorian_critic",
        title: "VICTORIAN CRITIC",
        line1: "Judgement passed through",
        line2: "gaslight and fog.",
        image: "/victorian.png",
    },
];

export default function SelectPage() {
    const router = useRouter();

    const handleSelect = (vibeId) => {
        router.push(`/gallery?vibe=${vibeId}`);
    };

    return (
        <section className="hero-container">
            {/* Background */}
            <div className="hero-background" aria-hidden="true" />
            <div className="hero-overlay" aria-hidden="true" />
            <div className="hero-mist" aria-hidden="true" />

            {/* Back Button */}
            <a
                href="/"
                className="absolute top-8 left-8 z-20 text-cream-muted hover:text-cream transition-colors font-serif"
            >
                ← Back
            </a>

            {/* Main Content */}
            <div className="relative z-10 text-center px-4 py-16 w-full">
                {/* Title */}
                <h1 className="select-title font-serif text-3xl md:text-5xl font-normal text-cream mb-16 tracking-wider">
                    WHICH ERA CALLS TO YOU?
                </h1>

                {/* Frame Cards */}
                <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 max-w-6xl mx-auto">
                    {vibes.map((vibe, index) => (
                        <button
                            key={vibe.id}
                            onClick={() => handleSelect(vibe.id)}
                            className="frame-card group"
                            style={{ animationDelay: `${index * 200}ms` }}
                        >
                            {/* Frame Image */}
                            <div className="frame-image-wrapper">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={vibe.image}
                                    alt={vibe.title}
                                    className="frame-image"
                                />
                                {/* Hover Glow */}
                                <div className="frame-glow" />
                            </div>

                            {/* Text Below Frame */}
                            <div className="mt-6 text-center">
                                <h2 className="font-serif text-xl md:text-2xl text-cream tracking-widest mb-3">
                                    {vibe.title}
                                </h2>
                                <p className="text-cream-muted text-sm italic leading-relaxed">
                                    {vibe.line1}
                                    <br />
                                    {vibe.line2}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
}
