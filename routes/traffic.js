import express from "express";
import { signalTraffic, getTrafficStatus } from "../controllers/trafficController.js";
import { verifyToken } from "../middleware/authMiddleware.js"; // Para proteger el POST

const router = express.Router();

// POST: Solo usuarios logueados (con token válido) pueden reportar tráfico
router.post("/signal", verifyToken, signalTraffic);

// GET: La consulta del estado debe ser pública
router.get("/status/:id", getTrafficStatus);

export default router;