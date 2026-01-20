require('dotenv').config({ path: __dirname + '/../.env.local' });
const express = require('express');
const corsMiddleware = require('./config/corsConfig');
const OpenAI = require('openai').default;

const app = express();
app.use(corsMiddleware);
app.use(express.json());

const client = new OpenAI({
    apiKey: process.env.IOINTELLIGENCE_API_KEY,
    baseURL: "https://api.intelligence.io.solutions/api/v1/",
});

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