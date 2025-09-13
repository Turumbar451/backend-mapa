// routes/auth.js
//cuando llega una peticion con algun metodo, mandala al controlador
//o sea un endpoint se encarga de recibir las peticiones y mandarlas al controlador
import express from "express";
import { registerUser, loginUser, getSession } from "../controllers/authController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
const router = express.Router();

// POST /api/signup
router.post("/login", loginUser); //router es un mini servidor gestor de rutas 
router.get("/session", verifyToken, getSession); //get para obtener datos, en este caso la sesion
router.post("/signup", registerUser); //post manda datos en el body y /signup es la ruta por la cual se manda, por eso el fetch en el frontend es a /api/signup

export default router;
