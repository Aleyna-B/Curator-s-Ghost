const axios = require('axios');

async function runDebate({ artworkTitle, artist, client, sendSSE }) {
    console.log(`⚔️ IGNITING REAL-TIME DEBATE: ${artworkTitle}`);

    if (!client) {
        // Mock stream for testing without API key
        sendSSE({ speaker: "lorenzo", text: "Ah, behold the divine light! (Mock SSE)" });
        await new Promise(r => setTimeout(r, 1500));
        sendSSE({ speaker: "edmund", text: "Hmph. Just sloppy brushwork if you ask me. (Mock SSE)" });
        return;
    }

    const conversation = [];
    const API_KEY = process.env.IOINTELLIGENCE_API_KEY;
    const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`
    };

    const turns = 5;
    let currentSpeaker = "lorenzo";

    for (let i = 0; i < turns; i++) {
        const isLorenzo = currentSpeaker === "lorenzo";

        // Construct prompt
        let prompt = "";
        if (i === 0) {
            prompt = `You are Lorenzo, a Renaissance art curator. 
            PRAISE the artwork "${artworkTitle}" by ${artist || 'Unknown'}. 
            Be poetic. Write exactly 3 sentences.`;
        } else {
            const lastMessage = conversation[conversation.length - 1].text;
            if (isLorenzo) {
                prompt = `You are Lorenzo. The critic Edmund just said: "${lastMessage}". 
                DEFEND the artwork and counter his criticism with passion. 
                Write exactly 3 sentences. Be poetic.`;
            } else {
                prompt = `You are Edmund. The curator Lorenzo just said: "${lastMessage}". 
                DISMISS his praise as naive. Find a flaw in the artwork he missed. 
                Write exactly 3 sentences. Be harsh.`;
            }
        }

        // Prepare Payload
        const payload = {
            objective: prompt,
            agent_names: ["custom_agent"],
            args: {
                type: "custom",
                name: isLorenzo ? "lorenzo_agent" : "edmund_agent",
                objective: isLorenzo ? "Praise artwork" : "Criticize artwork",
                instructions: isLorenzo
                    ? "You are a Renaissance curator. Praise the art."
                    : "You are a Victorian critic. Criticize the art."
            }
        };

        let reply = "";

        try {
            // Call io.net API
            const response = await axios.post("https://api.intelligence.io.solutions/api/v1/workflows/run", payload, { headers });
            reply = response.data?.result || response.data?.outputs?.[0]?.content || "";

            if (!reply) throw new Error("Empty response from io.net");

        } catch (err) {
            console.warn(`Turn ${i + 1} failed, using fallback...`);
            // Fallback
            try {
                const fb = await client.chat.completions.create({
                    model: "meta-llama/Llama-3.3-70B-Instruct",
                    messages: [
                        { role: "system", content: "You are an AI debater. Respond in character." },
                        { role: "user", content: prompt }
                    ],
                    max_completion_tokens: 150
                });
                reply = fb.choices[0]?.message?.content || "Indescribable...";
            } catch (fbErr) {
                reply = "...";
            }
        }

        // Add to local history
        conversation.push({ speaker: currentSpeaker, text: reply });

        // Stream to frontend
        sendSSE({ speaker: currentSpeaker, text: reply });

        // Toggle speaker
        currentSpeaker = isLorenzo ? "edmund" : "lorenzo";
    }

    console.log("Debate streaming complete.");
}

module.exports = {
    runDebate
};
