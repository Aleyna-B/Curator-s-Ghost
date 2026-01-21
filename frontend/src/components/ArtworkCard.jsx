"use client";

import Link from "next/link";

export default function ArtworkCard({ artwork, vibe }) {
    const { id, title, artist, year, imageUrl } = artwork;

    return (
        <Link href={`/artwork/${id}?vibe=${vibe}`}>
            <article className="artwork-card group cursor-pointer rounded-lg overflow-hidden bg-muted/50 border border-ghost hover:border-primary/30">
                <div className="relative aspect-[3/4] overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={imageUrl || "/placeholder-art.jpg"}
                        alt={title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                <div className="p-4 space-y-1">
                    <h3 className="font-serif text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {title}
                    </h3>
                    <p className="text-secondary text-sm">
                        {artist}
                    </p>
                    <p className="text-secondary/70 text-xs">
                        {year}
                    </p>
                </div>
            </article>
        </Link>
    );
}
