import TrafficSignal from '../models/trafficSignal.js';

// Duración de la alerta )
const THIRTY_MINUTES_MS = 30 * 60 * 1000;

// Endpoint 1: POST /api/traffic/signal
// Activa o reinicia el contador de tráfico para una ruta.
export const signalTraffic = async (req, res) => {
    // req.body debe contener el ID numérico de la ruta
    const { route_id } = req.body;

    if (route_id === undefined || route_id === null) {
        return res.status(400).json({ success: false, message: 'Falta el ID de la ruta.' });
    }

    try {
        // Busca el registro, si existe lo actualiza, si no existe lo crea (upsert: true)
        const updatedSignal = await TrafficSignal.findOneAndUpdate(
            { route_id: Number(route_id) },
            { $set: { last_pressed_at: new Date() } }, // Reinicia el contador a la hora actual
            { new: true, upsert: true }
        );

        res.status(200).json({
            success: true,
            message: 'Señal de tráfico reportada y contador reiniciado.',
            last_update: updatedSignal.last_pressed_at
        });
    } catch (error) {
        console.error('Error al reportar tráfico:', error);
        res.status(500).json({ success: false, error: 'Error interno del servidor.' });
    }
};

// Endpoint 2: GET /api/traffic/status/:id
// Consulta si la alerta de tráfico está activa.
export const getTrafficStatus = async (req, res) => {
    const route_id = Number(req.params.id);

    if (isNaN(route_id)) {
        return res.json({ traffic: false, message: 'ID de ruta inválido.' });
    }

    try {
        const signal = await TrafficSignal.findOne({ route_id });

        if (!signal) {
            // Si no hay registro, no hay tráfico
            return res.json({ traffic: false, message: 'Sin registros de tráfico.' });
        }

        const lastPressedTime = signal.last_pressed_at.getTime();
        const currentTime = new Date().getTime();

        // (Tiempo actual - Última pulsación) < 30 minutos
        const isTrafficActive = (currentTime - lastPressedTime) < THIRTY_MINUTES_MS;

        res.json({
            traffic: isTrafficActive,
            last_update: signal.last_pressed_at,
            message: isTrafficActive ? 'Alerta activa.' : 'Alerta expirada.'
        });
    } catch (error) {
        console.error('Error al obtener estado de tráfico:', error);
        res.status(500).json({ traffic: false, error: 'Error al consultar estado.' });
    }
};