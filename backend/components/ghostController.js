const axios = require('axios');
const MET_API = 'https://collectionapi.metmuseum.org/public/collection/v1';
const { orchestratorAgent } = require('./orchestraAgent');
const { agentPersonas, baseInstructions } = require('./personaPrompts');
const { generateMockCritique } = require('./mockData');
const { extractJSON } = require('./jsonParser');

function registerGhostRoutes(app, client) {
    // In-memory conversation storage (for demo - use Redis/DB in production)
    const conversations = new Map();

    // POST /api/critique - Ghost Critique & Spectral Secrets
    app.post('/api/critique', async (req, res) => {
        try {
            const { artworkId, persona } = req.body;

            // Fetch artwork data
            const objRes = await axios.get(`${MET_API}/objects/${artworkId}`);
            const artwork = objRes.data;
            const artist = artwork.artistDisplayName || 'Unknown Artist';
            const title = artwork.title || 'Untitled';

            // If no AI client, return mock
            if (!client) {
                console.log("Using mock critique (No API Key)");
                return res.json(generateMockCritique(artwork));
            }

            // AI PROMPT
            const systemPrompt = `You are a Ghost Curator. 
        Analyze the artwork "${title}" by ${artist} (${artwork.objectDate}, ${artwork.medium}).
        
        Persona: ${persona} (renaissance=poetic/scholarly, impressionism=dreamy/light-focused, victorian_critic=stern/technical).
        
        Output valid JSON only:
        {
          "critique": "text",
          "quickInsight": "text",
          "secrets": [
            { "text": "Short detail", "top": "50%", "left": "50%" }
          ]
        }
        Generate exactly 3 secrets with random coordinates (e.g. "45%").
        If you cannot find specific secrets, invent mysterious technical details or artistic observations.`;

            const response = await client.chat.completions.create({
                model: "meta-llama/Llama-3.3-70B-Instruct",
                messages: [
                    { role: "system", content: "You are a JSON-generating backend for an art app. Output ONLY JSON." },
                    { role: "user", content: systemPrompt }
                ],
                temperature: 0.7,
                max_completion_tokens: 600,
                response_format: { type: "json_object" }
            });

            // Parse JSON
            const rawContent = response.choices[0].message.content;
            console.log("Raw AI Response:", rawContent);

            let aiData;
            try {
                aiData = extractJSON(rawContent);
            } catch (e) {
                console.error("Failed to parse AI JSON. Error:", e.message);
                console.error("Raw Content was:", rawContent);
                return res.json(generateMockCritique(artwork));
            }

            console.log("Parsed AI Data:", aiData);
            res.json(aiData);

        } catch (error) {
            console.error('Critique error:', error.message);
            res.status(500).json({ error: 'The ghost remains silent...' });
        }
    });

    // ============================================
    // GHOST AGENT - CONVERSATIONAL AI
    // ============================================

    // Ghost Agent Chat Endpoint
    app.post('/api/agent/chat', async (req, res) => {
        try {
            const { sessionId, message, persona = 'victorian_critic', artworkContext, mode = 'curator' } = req.body;

            if (!message) {
                return res.status(400).json({ error: "Message is required" });
            }

            if (!client) {
                return res.json({
                    reply: "The spirits are resting... (API key not configured)",
                    sessionId
                });
            }

            // -----------------------------
            // ORCHESTRATOR AGENT (io.net)
            // -----------------------------
            let plan = null;
            if (mode !== 'subject') {
                try {
                    plan = await orchestratorAgent({ message });
                    console.log(" Orchestrator Plan:", plan);
                } catch (error) {
                    console.warn(" Orchestrator failed, proceeding without plan:", error.message);
                }
            }

            // Get or create conversation history
            const convKey = sessionId || `session_${Date.now()}`;
            if (!conversations.has(convKey)) {
                conversations.set(convKey, []);
            }
            const history = conversations.get(convKey);

            // Build system prompt based on MODE
            let systemPrompt = "";

            if (mode === 'subject' && artworkContext) {
                // --- LIVING SUBJECT MODE ---
                systemPrompt = `You are NOT a curator. You are the LIVING ENTITY or SPIRIT inside the artwork "${artworkContext.title}" by ${artworkContext.artist}.
            
            CORE INSTRUCTIONS:
            1. Identify what you are based on the title/artist (e.g. if portrait -> be the person; if landscape -> be the spirit of the place; if abstract -> be the emotion).
            2. You are trapped in the frame. You do NOT know about the modern world, iPhones, or the internet.
            3. Speak from your time period and perspective. Share your memories, regrets, or feelings.
            4. If asked "Who are you?", explain your existence within the canvas.
            5. Be immersive, emotional, and slightly mysterious.
            
            Current Role Context: You are in the artwork "${artworkContext.title}".
            `;
            } else {
                // --- CURATOR MODE (Default) ---
                const personaPrompt = agentPersonas[persona] || agentPersonas.victorian_critic;
                systemPrompt = `${personaPrompt}\n${baseInstructions}`;

                // Add orchestrator strategy
                if (plan && plan.intent && plan.focus) {
                    systemPrompt += `
The user is asking a follow-up question about the artwork.
Response strategy:
- Intent: ${plan.intent}
- Focus: ${plan.focus}

Stay fully in character and adapt your response accordingly.
`;
                }

                // Add artwork context
                if (artworkContext) {
                    systemPrompt += `\n\nCurrently discussing: "${artworkContext.title}" by ${artworkContext.artist} (${artworkContext.year || 'Unknown Date'}).`;
                }
            }

            // Add user message to history
            history.push({ role: "user", content: message });

            const messages = [
                { role: "system", content: systemPrompt },
                ...history.slice(-10)
            ];

            // Call IO Intelligence
            const response = await client.chat.completions.create({
                model: "meta-llama/Llama-3.3-70B-Instruct",
                messages: messages,
                temperature: 0.8,
                max_completion_tokens: 300
            });

            const rawReply = response.choices[0].message.content;
            console.log("Raw AI Response:", rawReply);
            const reply = (rawReply || "").trim();

            history.push({ role: "assistant", content: reply });

            if (history.length > 20) {
                history.splice(0, history.length - 20);
            }

            res.json({
                reply,
                sessionId: convKey
            });

        } catch (error) {
            console.error("Ghost Agent error:", error);
            res.status(500).json({ error: "The ghost has retreated into the shadows..." });
        }
    });

    // Clear conversation endpoint
    app.delete('/api/agent/chat/:sessionId', (req, res) => {
        const { sessionId } = req.params;
        conversations.delete(sessionId);
        res.json({ message: "Conversation cleared" });
    });

    // ============================================
    // DEBATE MODE (Real-Time Stream) ⚔️
    // ============================================
    app.post('/api/agent/debate', async (req, res) => {
        // Init Server-Sent Events (SSE)
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const sendSSE = (data) => {
            res.write(`data: ${JSON.stringify(data)}\n\n`);
        };

        try {
            const { artworkId, artworkTitle, artist } = req.body;

            if (!client) {
                // Mock stream for testing without API key
                sendSSE({ speaker: "lorenzo", text: "Ah, behold the divine light! (Mock SSE)" });
                await new Promise(r => setTimeout(r, 1500));
                sendSSE({ speaker: "edmund", text: "Hmph. Just sloppy brushwork if you ask me. (Mock SSE)" });
                res.end();
                return;
            }

            console.log(`⚔️ IGNITING REAL-TIME DEBATE: ${artworkTitle}`);

            // Conversation history for context
            const conversation = [];
            const API_KEY = process.env.IOINTELLIGENCE_API_KEY;
            const headers = {
                "Content-Type": "application/json",
                Authorization: `Bearer ${API_KEY}`
            };

            // Loop for 5 turns
            const turns = 5;
            let currentSpeaker = "lorenzo";

            for (let i = 0; i < turns; i++) {
                // Step 1: Notify frontend we are 'typing' (optional, but good for UI sync)
                // Actually frontend handles typing, we just send logic. 
                // But we can send a "thinking" event if we wanted.

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

                // Add to history
                conversation.push({ speaker: currentSpeaker, text: reply });

                // STREAM TO FRONTEND IMMEDIATELY
                sendSSE({ speaker: currentSpeaker, text: reply });

                // Toggle speaker
                currentSpeaker = isLorenzo ? "edmund" : "lorenzo";
            }

            console.log("Debate streaming complete.");
            sendSSE({ done: true }); // Signal end
            res.end();

        } catch (error) {
            console.error("Debate stream error:", error);
            res.status(500).end();
        }
    });
}

module.exports = {
    registerGhostRoutes
};