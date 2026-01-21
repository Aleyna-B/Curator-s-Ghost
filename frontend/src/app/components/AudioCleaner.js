"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function AudioCleaner() {
    const pathname = usePathname();

    useEffect(() => {
        // Cancel audio immediately on any route change
        if (typeof window !== "undefined" && window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
    }, [pathname]);

    return null; // This component renders nothing, just handles side-effects
}
