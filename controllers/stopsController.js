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

export const searchStopsByName = async (req, res) => {
    try{
        //req.query es un objeto que contiene los parámetros que vienen de la query string
        //limit es el número de resultados que se van a mostrar
        const {nombre = "", limit = 5} = req.query;
        if (!nombre.trim()){
            // El estado 400 equivale a Bad Request que es cuando faltan datos :D
            return res.status(400).json({ error: "Falta nombre" });
        }
        const stops = await Stop.find(
            //regex es un operador de mongo que se utiliza para búsquedas y $options: "i" 
            // es para que no distinga entre mayúsculas y minúsculas
            {nombre: {$regex: nombre, $options: "i"} },
            //Solo se mostrarán estos campos
            "id nombre routes coordenadas"
        ) //Limita la cantidad de resultados
        .limit(Number(limit));
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error interno :C" });
    }
};
