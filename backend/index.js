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

// Start the Server
app.listen(8080, () => {
    console.log(`Ghost Server running on http://localhost:8080`);
});