import fs from "fs";
import path from "path";
import bcrypt from "bcrypt"; //libreria para hashear contraseñas

const usuariosPath = path.resolve("./data/usuarios.json");

// Registrar usuario
export const registerUser = (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.json({ success: false, message: "Faltan datos" });
    }

    const usuarios = JSON.parse(fs.readFileSync(usuariosPath, "utf-8"));

    if (usuarios.find(u => u.username === username)) {
        return res.json({ success: false, message: "Usuario ya existe" });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    usuarios.push({ username, password: hashedPassword, role: "user" });

    fs.writeFileSync(usuariosPath, JSON.stringify(usuarios, null, 2));

    res.json({ success: true });
};
