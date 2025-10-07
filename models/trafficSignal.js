import mongoose from "mongoose";

const TrafficSignalSchema = new mongoose.Schema({
    // El ID numérico de la ruta (consistente con el modelo 'Ruta')
    route_id: {
        type: Number,
        required: true,
        unique: true,
        index: true
    },
    // Timestamp de la última vez que un usuario reportó tráfico
    last_pressed_at: {
        type: Date,
        required: true,
        default: Date.now
    }
});

const TrafficSignal = mongoose.model('TrafficSignal', TrafficSignalSchema);
export default TrafficSignal;