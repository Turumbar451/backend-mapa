import Ruta from '../models/ruta.js'; // ruta.js exporta el modelo Ruta
import Stop from '../models/stop.js'; // stop.js exporta el modelo Stop
import ImportantSite from '../models/site.js';

// Controlador para la búsqueda unificada
export const unifiedSearch = async (req, res) => {
    const query = req.query.q;

    if (!query) {
        // Si no hay consulta, devuelve todas las rutas (o una lista vacía)
        const allRoutes = await Ruta.find({});
        return res.json(allRoutes);
    }

    // Configuración de la expresión regular para búsqueda insensible
    const regex = new RegExp(query, 'i'); // 'i' para case-insensitive

    try {
        // 1. Ejecutar las 3 búsquedas en paralelo (Promise.all)
        const [routesByLabel, stopsByNombre, sitesByName] = await Promise.all([
            // Búsqueda 1: Coincidencia en el label de la Ruta
            Ruta.find({ label: { $regex: regex } }).select('id'),

            // Búsqueda 2: Coincidencia en el nombre de la Parada
            Stop.find({ nombre: { $regex: regex } }).select('routes'),

            // Búsqueda 3: Coincidencia en el nombre del Sitio Importante
            ImportantSite.find({ name: { $regex: regex } }).select('route_ids'),
        ]);

        // 2. Consolidar todos los IDs de ruta únicos
        const uniqueRouteIds = new Set();

        // Rutas por label (usamos el campo 'id' de la Ruta)
        routesByLabel.forEach(route => uniqueRouteIds.add(route.id));

        // Rutas por paradas (usamos el campo 'routes' de la Parada)
        stopsByNombre.forEach(stop => {
            if (Array.isArray(stop.routes)) {
                stop.routes.forEach(id => uniqueRouteIds.add(id));
            }
        });

        // Rutas por sitios importantes (usamos el campo 'route_ids' del Sitio Importante)
        sitesByName.forEach(site => {
            if (Array.isArray(site.route_ids)) {
                site.route_ids.forEach(id => uniqueRouteIds.add(id));
            }
        });

        // Convertir Set a Array para usar en la consulta
        const idsArray = Array.from(uniqueRouteIds);

        if (idsArray.length === 0) {
            return res.json([]);
        }

        // 3. Obtener los objetos Ruta finales
        const finalRoutes = await Ruta.find({ id: { $in: idsArray } });

        res.json(finalRoutes);

    } catch (error) {
        console.error('Error en búsqueda unificada:', error);
        res.status(500).json({ message: 'Error interno del servidor al buscar.' });
    }
};