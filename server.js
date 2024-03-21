const express = require('express');
const axios = require('axios');
const Vibrant = require('node-vibrant');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cors());

// Endpoint to fetch colors based on a word
app.post('/api/colors', async (req, res) => {
    try {
        const word = req.body.word;
        const images = await fetchImages(word);
        const colors = await getDominantColors(images);
        return res.status(200).json(colors);
    } catch (error) {
        console.error('Error fetching colors:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Function to fetch images related to a word
async function fetchImages(word) {
    const response = await axios.get(`https://api.unsplash.com/search/photos?page=1&query=${word}&client_id=VEVJ3A-CAcVMLrRo9hlVINggCO3kMHaJ9qTSMEa-L0Q`);
    return response.data.results.map((result) => result.urls.small);
}

async function getDominantColors(images) {
    const colors = [];
    try {
        await Promise.all(images.map(async (imageUrl) => {
            try {
                const palette = await Vibrant.from(imageUrl).getPalette();
                if (palette && palette.Vibrant && palette.Vibrant.hex) {
                    colors.push(palette.Vibrant.hex);
                } else {
                    console.warn(`No Vibrant color found for image: ${imageUrl}`);
                }
            } catch (error) {
                console.error(`Error fetching palette for image: ${imageUrl}`, error);
            }
        }));
    } catch (error) {
        console.error('Error processing images:', error);
    }
    return colors;
}

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
