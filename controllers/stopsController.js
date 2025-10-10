import Stop from "../models/stop.js";
import Ruta from "../models/ruta.js";

// [MODIFICACIÓN] La función nearbyStops ahora devuelve las paradas Y las rutas relevantes
export const nearbyStops = async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const limit = parseInt(req.query.limit) || 20;

    // Validación robusta (0 es válido)
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return res.status(400).json({ error: "Faltan coordenadas" });
    }

    // 1. Obtener las paradas cercanas (solo necesitamos los routes array)
    const stops = await Stop.find({
      coordenas: {
        $near: {
          $geometry: { type: "Point", coordinates: [lng, lat] },
        },
      },
    })
      .limit(limit)
      .select('nombre coordenas routes'); // Aseguramos que el campo routes esté seleccionado

    // 2. Extraer todos los IDs de ruta únicos de las paradas encontradas
    const uniqueRouteIds = new Set();
    stops.forEach(stop => {
      if (Array.isArray(stop.routes)) {
        stop.routes.forEach(id => uniqueRouteIds.add(id));
      }
    });

    const idsArray = Array.from(uniqueRouteIds);

    // 3. Obtener los detalles completos de las rutas relevantes
    // Incluir todos los campos necesarios para el frontend (id, label, color, points)
    const relevantRoutes = await Ruta.find({ id: { $in: idsArray } }).select('id label color points');

    // 4. Devolver un objeto unificado
    return res.json({
      nearbyStops: stops,
      relevantRoutes: relevantRoutes,
    });

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