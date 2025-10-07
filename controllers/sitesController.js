import site from "../models/site.js";

// GET /api/sites/search?nombre=Texto
export const searchSitesByName = async (req, res) => {
  try {
    const nombre = (req.query.nombre || "").trim();
    if (!nombre) return res.json([]);

    // Escapar regex
    const escaped = nombre.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    const rx = new RegExp(escaped, "i");

    const sites = await site
      .find({ name: rx })
      .select({ _id: 0, name: 1, route_ids: 1, routes_ids: 1 })
      .limit(20)
      .lean();

    const normalized = sites.map((s) => ({
      name: s.name,
      route_ids: Array.isArray(s.route_ids)
        ? s.route_ids
        : Array.isArray(s.routes_ids)
        ? s.routes_ids
        : [],
    }));

    res.json(normalized);
  } catch (error) {
    console.error("Error al buscar lugares", error);
    res.status(500).json({ message: "Error al buscar lugares" });
  }
};
