// routes/auth.js
//cuando llega una peticion con algun metodo, mandala al controlador
//o sea un endpoint se encarga de recibir las peticiones y mandarlas al controlador
import express from "express";
import { registerUser } from "../controllers/authController.js";

const router = express.Router();

// POST /api/signup
router.post("/signup", registerUser);

export default router;
