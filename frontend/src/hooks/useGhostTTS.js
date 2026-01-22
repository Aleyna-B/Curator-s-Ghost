import { useState, useEffect } from "react";

export function useGhostTTS() {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [voices, setVoices] = useState([]);

    // Load voices
    useEffect(() => {
        const loadVoices = () => {
            if (typeof window !== "undefined" && window.speechSynthesis) {
                const available = window.speechSynthesis.getVoices();
                setVoices(available);
            }
        };

        loadVoices();
        if (typeof window !== "undefined" && window.speechSynthesis) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }

        return () => {
            if (typeof window !== "undefined" && window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    const speakText = (text, currentPersona, currentMode) => {
        if (typeof window === "undefined" || !window.speechSynthesis) return;

        // Don't stop previous if chaining, but here we usually stop
        // For debate, we might want to queue? But for now stick to original logic
        window.speechSynthesis.cancel();

        const cleanText = text.replace(/\([^)]*\)/g, "").trim();
        if (!cleanText) return;

        const utterance = new SpeechSynthesisUtterance(cleanText);
        const selectedVoice = voices.find(v => v.name.includes("Google UK English Male"))
            || voices.find(v => v.name.includes("Male"))
            || voices[0];

        // Trigger words logic
        const triggerWords = ["death", "blood", "darkness", "eternal", "spirit", "doom", "curse", "shadow", "fear", "void", "grave", "mourn", "died", "kill", "ghost", "haunt"];
        const isPossessed = triggerWords.some(word => text.toLowerCase().includes(word));

        if (isPossessed) {
            utterance.pitch = 0.4;
            utterance.rate = 0.8;
        } else if (currentMode === 'subject') {
            utterance.pitch = 0.7;
            utterance.rate = 0.9;
        } else if (currentPersona === 'renaissance') {
            utterance.pitch = 1.0;
            utterance.rate = 0.9;
        } else if (currentPersona === 'victorian_critic') {
            utterance.pitch = 0.8;
            utterance.rate = 1.0;
        } else {
            utterance.pitch = 1.0;
            utterance.rate = 1.0;
        }

        if (selectedVoice) utterance.voice = selectedVoice;

        utterance.onend = () => setIsSpeaking(false);
        utterance.onstart = () => setIsSpeaking(true);

        window.speechSynthesis.speak(utterance);
    };

    return {
        isSpeaking,
        setIsSpeaking,
        speakText
    };
}
