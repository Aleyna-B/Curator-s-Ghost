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

// POST /api/critique - Ghost yorumu (Mock versiyon - API key olmadan çalışır)
app.post('/api/critique', async (req, res) => {
    try {
        const { artworkId, persona } = req.body;

        // Eser bilgisini al
        const objRes = await axios.get(`${MET_API}/objects/${artworkId}`);
        const artwork = objRes.data;

        // Mock critique - API key olunca gerçek AI ile değiştirilecek
        const mockCritiques = {
            renaissance: `Ah, "${artwork.title}" speaks to the divine perfection sought by the masters. The composition reveals a soul yearning for harmony between earthly beauty and celestial truth.`,
            impressionism: `In "${artwork.title}", one sees the fleeting dance of light upon form. The artist captures not mere reality, but the very essence of a moment suspended in time.`,
            victorian_critic: `"${artwork.title}" demonstrates considerable technical merit, though one must question whether it achieves the moral elevation expected of true art. The execution is... adequate.`
        };

        res.json({
            critique: mockCritiques[persona] || mockCritiques.victorian_critic,
            quickInsight: `A compelling work by ${artwork.artistDisplayName || 'an unknown master'} that rewards careful contemplation.`
        });

    } catch (error) {
        console.error('Critique error:', error.message);
        res.status(500).json({ error: 'The ghost remains silent...' });
    }
});

// ============================================
// EXISTING CHAT ENDPOINT
// ============================================
app.post('/api/chat', async (req, res) => {
    try {
        // 1. Get data from the frontend request
        // Expecting { messages: [...] } from the React app
        const { messages } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: "Invalid messages format" });
        }

        // 2. Call IO Intelligence
        const response = await client.chat.completions.create({
            model: "meta-llama/Llama-3.3-70B-Instruct", // Or your preferred model
            messages: messages, // Pass the conversation history
            temperature: 0.7,
            max_completion_tokens: 200 // Increased slightly for art descriptions
        });

        // 3. Send the answer back to the frontend
        const botReply = response.choices[0].message.content;
        res.json({ reply: botReply });

    } catch (error) {
        console.error("Error calling IO Intelligence:", error);
        res.status(500).json({ error: "Failed to fetch response from Ghost" });
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
        const { sessionId, message, persona = 'victorian_critic', artworkContext } = req.body;

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

        // Build system prompt
        const personaPrompt = agentPersonas[persona] || agentPersonas.victorian_critic;
        let systemPrompt = personaPrompt + baseInstructions;

        // Add artwork context if provided
        if (artworkContext) {
            systemPrompt += `\n\nCurrently discussing: "${artworkContext.title}" by ${artworkContext.artist} (${artworkContext.year}).`;
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

        const reply = response.choices[0].message.content;

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