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

// GET /api/sites/compare?nombreA=...&nombreB=...
// Also accepts aliases: a, b
export const compareSitesByName = async (req, res) => {
  try {
    const nombreA = (req.query.nombreA || req.query.a || "").trim();
    const nombreB = (req.query.nombreB || req.query.b || "").trim();

    if (!nombreA || !nombreB) {
      return res.status(400).json({ message: "Se requieren 'nombreA' y 'nombreB'" });
    }

    const escape = (s) => s.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    const rxA = new RegExp(escape(nombreA), "i");
    const rxB = new RegExp(escape(nombreB), "i");

    const [aList, bList] = await Promise.all([
      site
        .find({ name: rxA })
        .select({ _id: 0, name: 1, route_ids: 1, routes_ids: 1 })
        .limit(1)
        .lean(),
      site
        .find({ name: rxB })
        .select({ _id: 0, name: 1, route_ids: 1, routes_ids: 1 })
        .limit(1)
        .lean(),
    ]);

    const siteA = aList[0] || null;
    const siteB = bList[0] || null;

    const getRoutes = (s) => {
      const a = Array.isArray(s?.route_ids) ? s.route_ids : [];
      const b = Array.isArray(s?.routes_ids) ? s.routes_ids : [];
      // Normalizar a números únicos
      const merged = [...a, ...b].map((n) => Number(n)).filter((n) => Number.isFinite(n));
      return Array.from(new Set(merged));
    };

    const routesA = siteA ? getRoutes(siteA) : [];
    const routesB = siteB ? getRoutes(siteB) : [];

    // Intersección
    const setB = new Set(routesB);
    const intersection = routesA.filter((id) => setB.has(id));

    return res.json({
      a: siteA ? { name: siteA.name, route_ids: routesA } : null,
      b: siteB ? { name: siteB.name, route_ids: routesB } : null,
      intersection,
      count: intersection.length,
    });
  } catch (error) {
    console.error("Error al comparar lugares", error);
    res.status(500).json({ message: "Error al comparar lugares" });
  }
};
