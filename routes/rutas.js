import express from "express";
import {
  getListadoRutas,
  getTodasRutas,
  getRutaById,
  deleteRuta,
} from "../controllers/rutasController.js";

const router = express.Router();

router.get("/listado", getListadoRutas);
router.get("/todas", getTodasRutas);
router.get("/:id", getRutaById);

// Cambios negro
router.delete("/:id", deleteRuta);

export default router;
