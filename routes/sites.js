import { Router} from "express";
import site from "../models/site";

const router = Router();

// Método GET para buscar sitios por nombre
router.get("/search", async (req, res) => {
 try {
    const nombre = (req.query.nombre || "")
    if (!nombre) return res.json({});

    // Escapar regex
    const escaped = nombre.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
    const rx = new RegExp(escaped, "i");

    const sites = await site.find({name: rx})
        .select({_id: 0, name: 1, route_ids: 1})
        .limit(20)
        .lean();
    
    const normalized = sites.map(s => ({
        name: s.name,
        route_ids: Array.isArray(s.route_ids)
            ? s.route_ids
            : Array.isArray(s.route_ids)
            ? s.routes_ids
            : [],
    }));

    res.json(normalized);
    }   catch (error) {
        console.error("Error al buscar sitios", error);
        res.status(500).json({ message: "Error al buscar sitios" });
    }
});

export default router;
