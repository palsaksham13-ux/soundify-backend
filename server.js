const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/generate-playlist', async (req, res) => {
    try {
        const { prompt, tracks } = req.body;
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        const systemPrompt = `You are an AI music curator. Based on the user's vibe: "${prompt}", select tracks from the provided list. Return ONLY a valid JSON object with three keys: "title" (String), "description" (String), and "trackIds" (Array of Strings).`;
        
        const trackData = tracks.map(t => ({ id: t.id, title: t.title, artist: t.artist, genre: t.genre }));
        
        const result = await model.generateContent(`${systemPrompt}\n\nAvailable Tracks: ${JSON.stringify(trackData)}`);
        let responseText = result.response.text();
        responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        
        res.json(JSON.parse(responseText));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to generate playlist" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Soundify API running on port ${PORT}`));