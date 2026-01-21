// ============================================
// MET MUSEUM API INTEGRATION
// ============================================
const axios = require('axios');
const MET_API = 'https://collectionapi.metmuseum.org/public/collection/v1';

function registerMuseumRoutes(app) {
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
}

module.exports = {
    registerMuseumRoutes
};