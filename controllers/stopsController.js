import Stop from "../models/stop.js";
import Ruta from "../models/ruta.js";

export const nearbyStops = async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const limit = parseInt(req.query.limit) || 20;

    // Validación robusta (0 es válido)
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return res.status(400).json({ error: "Faltan coordenadas" });
    }

    // Asegúrate de tener índice 2dsphere en coordenas: db.stops.createIndex({ coordenas: "2dsphere" })
    const stops = await Stop.find({
      coordenas: {
        $near: {
          $geometry: { type: "Point", coordinates: [lng, lat] },
        },
      },
    }).limit(limit);

    return res.json(stops);
  } catch (err) {
    console.error("GET /stops/nearby error", err);
    return res.status(500).json({ error: "Error interno" });
  }
};

export const searchStopsByName = async (req, res) => {
  try {
    const { nombre = "", limit = 5 } = req.query;
    if (!nombre.trim()) {
      return res.status(400).json({ error: "Falta nombre" });
    }

    // 1) Buscar paradas por nombre en tu colección Stop
    // Proyección correcta: no pidas 'routes' ni 'coordenadas'
    const stops = await Stop.find(
      { nombre: { $regex: nombre, $options: "i" } },
      "nombre coordenas"
    ).limit(Number(limit));

    if (stops.length === 0) {
      return res.json([]);
    }

    // 2) Construir set de nombres encontrados
    const nombres = [...new Set(stops.map((s) => s.nombre))];

    // 3) Buscar en Ruta todas las rutas que contengan cualquiera de esos nombres
    const rutasDocs = await Ruta.find(
      { "stops.nombre": { $in: nombres } },
      "id stops.nombre"
    );

    // 4) Mapear nombre de parada -> Set de IDs de ruta
    const nombreToRouteIds = new Map();
    for (const ruta of rutasDocs) {
      const rid = ruta.id; // tu id numérico
      for (const st of ruta.stops || []) {
        if (nombres.includes(st.nombre)) {
          if (!nombreToRouteIds.has(st.nombre)) {
            nombreToRouteIds.set(st.nombre, new Set());
          }
          nombreToRouteIds.get(st.nombre).add(rid);
        }
      }
    }

    // 5) Enriquecer stops con routes (array numérico)
    const enriched = stops.map((s) => {
      const ids = Array.from(nombreToRouteIds.get(s.nombre) || []);
      return {
        nombre: s.nombre,
        coordenas: s.coordenas,
        routes: ids,
      };
    });

    return res.json(enriched);
  } catch (err) {
    console.error("GET /stops/search error", err);
    return res.status(500).json({ error: "Error interno :C" });
  }
};