import mongoose from "mongoose";

const rutaSchema = new mongoose.Schema({
    id: String,
    label: String,
    type: String,
    color: String,
    points: [[Number]],
    stops: [
        {
            coordenas: [Number],
            nombre: String
        }
    ],
    images: [String]
});

const Ruta = mongoose.model("Ruta", rutaSchema);

export default Ruta;
