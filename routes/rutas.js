import express from "express";
import Ruta from "../models/ruta.js";

const router = express.Router();

// 1️⃣ Traer listado ligero de rutas (_id y label)
router.get("/listado", async (req, res) => {
    try {
        const rutas = await Ruta.find({}, "_id label");
        res.json(rutas);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error al cargar listado de rutas" });
    }
});

// 2️⃣ Traer todas las rutas completas (para SSG)
router.get("/todas", async (req, res) => {
    try {
        const rutas = await Ruta.find({}); // todos los campos
        res.json(rutas);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error al cargar rutas completas" });
    }
});

// 3️⃣ Traer una ruta por ID (para usuario individual)
// routes/rutas.js
router.get("/:id", async (req, res) => {
    const { id } = req.params;
    console.log("Buscando ruta con id:", id, "=>", Number(id));
    try {
        const ruta = await Ruta.findOne({ id: Number(id) });

        if (!ruta) return res.status(404).json({ message: "Ruta no encontrada" });
        res.json(ruta);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error al cargar la ruta" });
    }
});





export default router;
