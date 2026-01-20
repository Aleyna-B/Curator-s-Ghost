"use client";

import Link from "next/link";
import Image from "next/image";

export default function ArtworkCard({ artwork, vibe }) {
    const { id, title, artist, year, imageUrl } = artwork;

    return (
        <Link href={`/artwork/${id}?vibe=${vibe}`}>
            <article className="artwork-card group cursor-pointer rounded-lg overflow-hidden bg-muted/50 border border-ghost hover:border-primary/30">
                <div className="relative aspect-[3/4] overflow-hidden">
                    <Image
                        src={imageUrl || "/placeholder-art.jpg"}
                        alt={title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
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
