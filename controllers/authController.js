import fs from "fs";
import path from "path";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const usuariosPath = path.resolve("./data/usuarios.json");
const SECRET = "mi_clave_secreta"; // Mejor usar process.env.JWT_SECRET en producción

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

// Login usuario
export const loginUser = (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.json({ success: false, message: "Faltan datos" });
    }

    const usuarios = JSON.parse(fs.readFileSync(usuariosPath, "utf-8"));

    const user = usuarios.find(u => u.username === username);
    if (!user) {
        return res.json({ success: false, message: "Usuario no encontrado" });
    }

    const passwordMatch = bcrypt.compareSync(password, user.password);
    if (!passwordMatch) {
        return res.json({ success: false, message: "Contraseña incorrecta" });
    }

    // Crear token JWT
    const token = jwt.sign(
        { username: user.username, role: user.role },
        SECRET,
        { expiresIn: "1d" } // duración 1 día
    );//SECRET es la clave secreta para firmar el token

    // Enviar cookie con httpOnly para seguridad 
    //o sea guarda el token en una cookie que no puede ser leida por JS del frontend
    res.cookie("token", token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
    // Login exitoso, enviar datos necesarios
    res.json({ success: true, username: user.username, role: user.role });
};

// Obtener sesión actual
export const getSession = (req, res) => {
    if (!req.user) return res.json({ user: null });
    res.json({ user: req.user });
};
