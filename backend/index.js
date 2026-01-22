require('dotenv').config({ path: __dirname + '/../.env.local' });
const express = require('express');
const corsMiddleware = require('./config/corsConfig');
const OpenAI = require('openai').default;

const { registerGhostRoutes } = require('./components/ghostController');
const { registerMuseumRoutes } = require('./components/museumController');

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
    console.log('IO Intelligence API configured');
} else {
    console.log('No API key found - running in mock mode');
}

registerMuseumRoutes(app);
registerGhostRoutes(app, client);

// Start the Server
app.listen(8080, () => {
    console.log(`Ghost Server running on http://localhost:8080`);
});