import Stop from "../models/stop.js";

export const nearbyStops = async (req, res) => {
    try {
        const lat = parseFloat(req.query.lat);
        const lng = parseFloat(req.query.lng);
        const limit = parseInt(req.query.limit) || 20;

        if (!lat || !lng) {
            return res.status(400).json({ error: "Faltan coordenadas" });
        }

        const stops = await Stop.find({
            coordenas: {
                $near: {
                    $geometry: { type: "Point", coordinates: [lng, lat] }
                }
            }
        }).limit(limit);

        res.json(stops);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error interno" });
    }
};
