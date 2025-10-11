import mongoose from "mongoose";

const usuarioSchema = new mongoose.Schema(
    {
        username: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: { type: String, default: "user" },

        // [MODIFICACIÓN CLAVE] Nuevos campos para preferencias
        favoritos: { type: [Number], default: [] }, // Array de IDs numéricos de ruta
        ocultos: { type: [Number], default: [] },   // Array de IDs numéricos de ruta
    },
    { timestamps: true }
);

// ... (resto del código del modelo)
const Usuario = mongoose.model("Usuario", usuarioSchema);

export default Usuario;
