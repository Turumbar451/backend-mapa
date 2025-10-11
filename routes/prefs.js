import express from "express";
import { getPrefs, togglePref } from "../controllers/userPrefsController.js";
import { verifyToken } from "../middleware/authMiddleware.js"; // Proteger acceso

const router = express.Router();

// Todas estas rutas requieren que el usuario esté autenticado
router.get("/prefs", verifyToken, getPrefs);
router.post("/toggle", verifyToken, togglePref);

export default router;

// En server.js, añadir: app.use('/api/user', prefsRoutes);