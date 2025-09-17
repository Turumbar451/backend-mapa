import express from "express";
import { getListadoRutas, getTodasRutas, getRutaById } from "../controllers/rutasController.js";

const router = express.Router();

router.get("/listado", getListadoRutas);
router.get("/todas", getTodasRutas);
router.get("/:id", getRutaById);

export default router;

