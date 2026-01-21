function generateMockCritique(artwork) {
    const randPos = () => Math.floor(Math.random() * 60) + 20 + '%';
    
    return {
        critique: `Ah, "${artwork.title}" speaks to us across the ages. The artist, ${artwork.artist}, has captured a moment of stillness that defies the chaos of their time.`,
        quickInsight: `A compelling work from ${artwork.objectDate || 'the past'} that rewards careful contemplation.`,
        secrets: [
            { top: randPos(), left: randPos(), text: "A hidden signature lies beneath the varnish." },
            { top: randPos(), left: randPos(), text: "X-ray reveals a previous composition here." },
            { top: randPos(), left: randPos(), text: "The light source here defies natural laws." }
        ]
    };
}

module.exports = { generateMockCritique };