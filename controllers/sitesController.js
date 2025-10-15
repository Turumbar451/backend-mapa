import site from "../models/site.js";

// helper: construye regex que empareja acentuadas y no acentuadas
const buildAccentRegex = (input) => {
  const escape = (s) => s.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
  const map = {
    a: "[aáÁA]", e: "[eéÉE]", i: "[iíÍI]", o: "[oóÓO]", u: "[uúÚüÜU]",
    A: "[aáÁA]", E: "[eéÉE]", I: "[iíÍI]", O: "[oóÓO]", U: "[uúÚüÜU]",
    n: "[nñÑN]", N: "[nñÑN]"
  };
  const expanded = escape(input).replace(/[aAeEiIoOuUnN]/g, (ch) => map[ch] || ch);
  return new RegExp(expanded, "i");
};

// GET /api/sites/search?nombre=Texto
export const searchSitesByName = async (req, res) => {
  try {
    const nombre = (req.query.nombre || "").trim();
    if (!nombre) return res.json([]);

    const rx = buildAccentRegex(nombre);

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
    const exactFlag = String(req.query.exact || "").toLowerCase() === "1";

    if (!nombreA || !nombreB) {
      return res.status(400).json({ message: "Se requieren 'nombreA' y 'nombreB'" });
    }

    const rxA = exactFlag ? new RegExp(`^${buildAccentRegex(nombreA).source}$`, "i") : buildAccentRegex(nombreA);
    const rxB = exactFlag ? new RegExp(`^${buildAccentRegex(nombreB).source}$`, "i") : buildAccentRegex(nombreB);

    const toArrayRoutes = (s) => Array.isArray(s?.route_ids) ? s.route_ids : (Array.isArray(s?.routes_ids) ? s.routes_ids : []);

    const pickBest = (q, list) => {
      if (!Array.isArray(list) || list.length === 0) return null;
      const norm = (x) => String(x || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const qn = norm(q);
      const items = list.map((s) => ({
        s,
        name: s.name,
        n: norm(s.name),
        routes: toArrayRoutes(s).map((n) => Number(n)).filter((n) => Number.isFinite(n)),
      }));

      // Score: exact > startsWith > includes; tie-breaker: more routes; then longer name
      const score = (it) => {
        if (it.n === qn) return 3000 + it.routes.length;
        if (it.n.startsWith(qn)) return 2000 + it.routes.length;
        if (it.n.includes(qn)) return 1000 + it.routes.length;
        return it.routes.length;
      };

      items.sort((a, b) => score(b) - score(a) || b.name.length - a.name.length);
      return items[0];
    };

    const [aList, bList] = await Promise.all([
      site
        .find({ name: rxA })
        .select({ _id: 0, name: 1, route_ids: 1, routes_ids: 1 })
        .limit(20)
        .lean(),
      site
        .find({ name: rxB })
        .select({ _id: 0, name: 1, route_ids: 1, routes_ids: 1 })
        .limit(20)
        .lean(),
    ]);

    const bestA = pickBest(nombreA, aList);
    const bestB = pickBest(nombreB, bList);

    const routesA = bestA ? Array.from(new Set(bestA.routes)) : [];
    const routesB = bestB ? Array.from(new Set(bestB.routes)) : [];

    const setB = new Set(routesB);
    const intersection = routesA.filter((id) => setB.has(id));

    return res.json({
      a: bestA ? { name: bestA.name, route_ids: routesA } : null,
      b: bestB ? { name: bestB.name, route_ids: routesB } : null,
      intersection,
      count: intersection.length,
    });
  } catch (error) {
    console.error("Error al comparar lugares", error);
    res.status(500).json({ message: "Error al comparar lugares" });
  }
};
