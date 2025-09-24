import express from "express";
import {
  getListadoRutas,
  getTodasRutas,
  getRutaById,
  deleteRuta,
  createRuta,
} from "../controllers/rutasController.js";

const router = express.Router();

router.get("/listado", getListadoRutas);
router.get("/todas", getTodasRutas);
router.get("/:id", getRutaById);

// Cambios negro
router.delete("/:id", deleteRuta);
router.post("/", createRuta);
export default router;
