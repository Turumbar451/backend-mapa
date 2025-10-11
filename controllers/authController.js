import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import Usuario from "../models/usuario.js";
const SECRET = "mi_clave_secreta"; // Mejor usar process.env.JWT_SECRET 

// Registrar usuario (sin cambios)
export const registerUser = async (req, res) => {
    const { username, password } = req.body;
    // ... (rest of registerUser logic)
    if (!username || !password) {
        return res.json({ success: false, message: "Faltan datos" });
    }

    const exists = await Usuario.findOne({ username });
    if (exists) {
        return res.json({ success: false, message: "Usuario ya existe" });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const newUser = new Usuario({ username, password: hashedPassword, role: "user" });
    await newUser.save()
    res.json({ success: true });
};


// Login usuario (Simplificado a la configuración de producción)
export const loginUser = async (req, res) => {
    const { username, password } = req.body;

    const user = await Usuario.findOne({ username });
    if (!user) return res.json({ success: false, message: "Usuario no encontrado" });

    const passwordMatch = bcrypt.compareSync(password, user.password);
    if (!passwordMatch) {
        return res.json({ success: false, message: "Contraseña incorrecta" });
    }

    // Crear token JWT
    const token = jwt.sign(
        // [MODIFICACIÓN CLAVE] Asegurar que el ID sea una cadena para evitar errores de tipo en la BD
        { username: user.username, role: user.role, id: user._id.toString() },
        SECRET,
        { expiresIn: "1d" }
    );

    // [CONFIGURACIÓN ESTRICTA DE PRODUCCIÓN]
    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // true en Railway
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // "none" para cross-site
        maxAge: 24 * 60 * 60 * 1000 // 1 día
    });

    // Login exitoso, enviar datos necesarios
    res.json({ success: true, username: user.username, role: user.role });
};


// Obtener sesión actual (sin cambios)
export const getSession = (req, res) => {
    if (!req.user) return res.json({ user: null });
    res.json({ user: req.user });
};

// Cerrar sesión: limpiar cookie de autenticación
export const logoutUser = (req, res) => {
    try {
        // [CONFIGURACIÓN ESTRICTA DE PRODUCCIÓN]
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            path: "/",
        });
        return res.json({ success: true, message: "Sesión cerrada" });
    } catch (e) {
        return res.status(500).json({ success: false, message: "No se pudo cerrar la sesión" });
    }
};