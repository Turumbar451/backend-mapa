import mongoose from "mongoose";

const StopSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    coordenas: {
        type: { type: String, enum: ["Point"], required: true },
        coordinates: { type: [Number], required: true } // [lng, lat]
    },
    routes: { type: [Number], default: [] }, // ids de rutas
});

// Índice geoespacial para consultas por proximidad
StopSchema.index({ coordenas: "2dsphere" });

export default mongoose.model("Stop", StopSchema);
