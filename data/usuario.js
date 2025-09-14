import mongoose from "mongoose";

const UsuarioSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // ya tienes hashes con bcrypt
    role: { type: String, default: "user" }
});

export default mongoose.model("Usuario", UsuarioSchema);
