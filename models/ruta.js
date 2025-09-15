import mongoose from "mongoose";

const rutaSchema = new mongoose.Schema({
    id: Number, // <-- cambiar a Number
    label: String,
    type: String,
    color: String,
    points: [[Number]],
    stops: [
        {
            coordenadas: [Number], // revisa que el nombre sea correcto
            nombre: String
        }
    ],
    images: [String]
});

const Ruta = mongoose.model("Ruta", rutaSchema);

export default Ruta;

