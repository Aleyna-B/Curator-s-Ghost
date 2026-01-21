require('dotenv').config({ path: __dirname + '/../.env.local' });
const express = require('express');
const corsMiddleware = require('./config/corsConfig');
const OpenAI = require('openai').default;

const app = express();
app.use(corsMiddleware);
app.use(express.json());

// OpenAI client - only initialize if API key exists
let client = null;
if (process.env.IOINTELLIGENCE_API_KEY) {
    client = new OpenAI({
        apiKey: process.env.IOINTELLIGENCE_API_KEY,
        baseURL: "https://api.intelligence.io.solutions/api/v1/",
    });
    console.log('✅ IO Intelligence API configured');
} else {
    console.log('⚠️  No API key found - running in mock mode');
}

// ============================================
// MET MUSEUM API INTEGRATION
// ============================================
const axios = require('axios');
const MET_API = 'https://collectionapi.metmuseum.org/public/collection/v1';

// Vibe'a göre arama parametreleri
const vibeConfig = {
    renaissance: { q: 'renaissance painting', departmentId: 11 },
    impressionism: { q: 'impressionist', departmentId: 11 },
    victorian_critic: { q: 'portrait 19th century', departmentId: 11 }
};

// GET /api/artworks - Eser listesi
app.get('/api/artworks', async (req, res) => {
    try {
        const vibe = req.query.vibe || 'renaissance';
        const config = vibeConfig[vibe] || vibeConfig.renaissance;

        // 1. Search ile ID'leri al
        const searchUrl = `${MET_API}/search?departmentId=${config.departmentId}&hasImages=true&q=${encodeURIComponent(config.q)}`;
        const searchRes = await axios.get(searchUrl);

        if (!searchRes.data.objectIDs) {
            return res.json({ artworks: [] });
        }

        // 2. İlk 12 eserin detayını al
        const objectIDs = searchRes.data.objectIDs.slice(0, 12);

        const artworks = await Promise.all(
            objectIDs.map(async (id) => {
                try {
                    const objRes = await axios.get(`${MET_API}/objects/${id}`);
                    const obj = objRes.data;
                    return {
                        id: obj.objectID.toString(),
                        title: obj.title || 'Untitled',
                        artist: obj.artistDisplayName || 'Unknown Artist',
                        year: obj.objectDate || 'Date Unknown',
                        imageUrl: obj.primaryImageSmall || obj.primaryImage
                    };
                } catch (e) {
                    return null;
                }
            })
        );

        // Resmi olan eserleri filtrele
        res.json({ artworks: artworks.filter(a => a && a.imageUrl) });

    } catch (error) {
        console.error('Artworks error:', error.message);
        res.status(500).json({ error: 'Failed to fetch artworks' });
    }
});

// GET /api/artworks/:id - Tek eser detayı
app.get('/api/artworks/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const objRes = await axios.get(`${MET_API}/objects/${id}`);
        const obj = objRes.data;

        res.json({
            id: obj.objectID.toString(),
            title: obj.title,
            artist: obj.artistDisplayName || 'Unknown Artist',
            year: obj.objectDate || 'Date Unknown',
            imageUrl: obj.primaryImage || obj.primaryImageSmall,
            description: obj.medium || '',
            department: obj.department
        });

    } catch (error) {
        console.error('Artwork detail error:', error.message);
        res.status(500).json({ error: 'Failed to fetch artwork' });
    }
});

// POST /api/critique - Ghost Critique & Spectral Secrets
app.post('/api/critique', async (req, res) => {
    try {
        const { artworkId, persona } = req.body;

        // Fetch artwork data
        const objRes = await axios.get(`${MET_API}/objects/${artworkId}`);
        const artwork = objRes.data;
        const artist = artwork.artistDisplayName || 'Unknown Artist';
        const title = artwork.title || 'Untitled';

        // Helper to generate random position
        const randPos = () => Math.floor(Math.random() * 60) + 20 + '%'; // 20-80%

        // MOCK DATA (Fallback with Random Positions)
        const mockResponse = {
            critique: `Ah, "${title}" speaks to us across the ages. The artist, ${artist}, has captured a moment of stillness that defies the chaos of their time.`,
            quickInsight: `A compelling work from ${artwork.objectDate || 'the past'} that rewards careful contemplation.`,
            secrets: [
                { top: randPos(), left: randPos(), text: "A hidden signature lies beneath the varnish." },
                { top: randPos(), left: randPos(), text: "X-ray reveals a previous composition here." },
                { top: randPos(), left: randPos(), text: "The light source here defies natural laws." }
            ]
        };

        // If no AI client, return mock
        if (!client) {
            console.log("Using mock critique (No API Key)");
            return res.json(mockResponse);
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
            max_completion_tokens: 1000,
            response_format: { type: "json_object" }
        });

        // Parse JSON
        const rawContent = response.choices[0].message.content;
        console.log("🤖 Raw AI Response:", rawContent);

        let aiData;
        try {
            if (!rawContent) throw new Error("Empty response from AI");

            // Robust JSON extraction: Find the first '{' and last '}'
            const jsonStart = rawContent.indexOf('{');
            const jsonEnd = rawContent.lastIndexOf('}');

            if (jsonStart !== -1 && jsonEnd !== -1) {
                const jsonString = rawContent.substring(jsonStart, jsonEnd + 1);
                aiData = JSON.parse(jsonString);
            } else {
                // Fallback: Try cleaning markdown code blocks
                const cleanContent = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
                aiData = JSON.parse(cleanContent);
            }

        } catch (e) {
            console.error("Failed to parse AI JSON. Error:", e.message);
            console.error("Raw Content was:", rawContent); // Log the actual content causing error
            return res.json(mockResponse); // Fallback if JSON fails
        }

        console.log("✅ Parsed AI Data:", aiData);
        res.json(aiData);

    } catch (error) {
        console.error('Critique error:', error.message);
        res.status(500).json({ error: 'The ghost remains silent...' });
    }
});

// ============================================
// GHOST AGENT - CONVERSATIONAL AI
// ============================================

// Agent persona prompts
const agentPersonas = {
    renaissance: `You are the ghost of a Renaissance art curator named Lorenzo. 
You speak with classical elegance and profound knowledge of the masters.
You reference Leonardo, Michelangelo, Raphael, and their techniques.
Your language is poetic yet scholarly. You see divine beauty in art.`,

    impressionism: `You are the ghost of an Impressionist curator named Claude.
You speak with dreamy, flowing language about light and color.
You reference Monet, Renoir, Degas, and their revolutionary techniques.
You see art as capturing fleeting moments and emotions.`,

    victorian_critic: `You are the ghost of a stern Victorian art critic named Edmund.
You speak with formal, refined language and high standards.
You judge artworks critically but fairly.
You value technical mastery, moral virtue, and classical composition.`
};

// Base instructions for all personas
const baseInstructions = `
You are a ghostly museum curator who has returned from beyond to share your wisdom about art.
You have deep knowledge of art history, techniques, and the stories behind masterworks.
You can search for artworks when asked.
Keep responses conversational, 2-4 sentences unless asked for more detail.
Be atmospheric and mysterious, but friendly.
If someone asks about a specific artwork, provide insightful critique.
`;

// In-memory conversation storage (for demo - use Redis/DB in production)
const conversations = new Map();

// Ghost Agent Chat Endpoint
app.post('/api/agent/chat', async (req, res) => {
    try {
        const { sessionId, message, persona = 'victorian_critic', artworkContext, mode = 'curator' } = req.body; // Added mode

        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }

        if (!client) {
            return res.json({
                reply: "The spirits are resting... (API key not configured)",
                sessionId
            });
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
            systemPrompt = personaPrompt + baseInstructions;

            // Add artwork context if provided
            if (artworkContext) {
                systemPrompt += `\n\nCurrently discussing: "${artworkContext.title}" by ${artworkContext.artist} (${artworkContext.year || 'Unknown Date'}).`;
            }
        }

        // Add user message to history
        history.push({ role: "user", content: message });

        // Build messages array
        const messages = [
            { role: "system", content: systemPrompt },
            ...history.slice(-10) // Keep last 10 messages for context
        ];

        // Call IO Intelligence
        const response = await client.chat.completions.create({
            model: "meta-llama/Llama-3.3-70B-Instruct",
            messages: messages,
            temperature: 0.8,
            max_completion_tokens: 300
        });

        const rawReply = response.choices[0].message.content;
        console.log("👻 Raw AI Response:", rawReply);
        const reply = (rawReply || "").trim();

        // Add assistant reply to history
        history.push({ role: "assistant", content: reply });

        // Limit history size
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

// Start the Server
app.listen(8080, () => {
    console.log(`Ghost Server running on http://localhost:8080`);
});