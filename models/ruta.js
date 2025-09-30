import mongoose from "mongoose";

const StopSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    // Alineado con el controlador: coordenas: [lat, lng]
    coordenas: {
      type: [Number],
      validate: (v) => Array.isArray(v) && v.length === 2,
      required: true,
    },
  },
  { _id: false }
);

const RutaSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    label: { type: String, required: true },
    type: { type: String, enum: ["line", "circuit"], required: true },
    color: { type: String, required: true },
    // [[lat, lng], ...]
    points: { type: [[Number]], default: [] },
    stops: { type: [StopSchema], default: [] },
    images: { type: [String], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model("Ruta", RutaSchema);

