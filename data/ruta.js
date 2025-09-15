import mongoose from "mongoose";

const StopSchema = new mongoose.Schema({
  coordenas: [Number], // [lat, lng]
  nombre: String
});

const RutaSchema = new mongoose.Schema({
  id: String,
  label: String,
  type: String,
  color: String,
  points: [[Number]], // coordenadas
  stops: [StopSchema],
  images: [String]
});

export default mongoose.model("Ruta", RutaSchema);
