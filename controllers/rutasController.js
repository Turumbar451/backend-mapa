import Ruta from "../models/ruta.js";
import Stop from "../models/stop.js";
import mongoose from "mongoose";

export const getListadoRutas = async (req, res) => {
  try {
    const rutas = await Ruta.find({}, "_id id label");
    return res.json(rutas);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error al cargar listado de rutas" });
  }
};


export const getRutaById = async (req, res) => {
  const { id } = req.params;
  try {
    // Tu GET actual busca por el campo id numérico
    const ruta = await Ruta.findOne({ id: Number(id) });
    if (!ruta) return res.status(404).json({ message: "Ruta no encontrada" });
    res.json(ruta);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al cargar la ruta" });
  }
};

// Delete post Emir
export const deleteRuta = async (req, res) => {
  try {
    const num = Number(req.params.id);
    if (!Number.isFinite(num)) {
      return res.status(400).json({ message: "ID inválido (numérico)" });
    }
    const deleted = await Ruta.findOneAndDelete({ id: num });
    if (!deleted) return res.status(404).json({ message: "Ruta no encontrada" });
    return res.json({ message: "Ruta eliminada correctamente" });
  } catch (err) {
    console.error("DELETE /rutas/:id error", err);
    return res.status(500).json({ message: "Error eliminando ruta" });
  }
};

export const createRuta = async (req, res) => {
  try {
    const {
      id,
      label,
      type,
      color,
      points = [],
      stops = [],
      images,
    } = req.body || {};

    // Validaciones básicas
    const numId = Number(id);
    if (!Number.isFinite(numId)) {
      return res.status(400).json({ message: "ID inválido (numérico)" });
    }
    if (!label || !String(label).trim()) {
      return res.status(400).json({ message: "Label inválido" });
    }
    if (!["line", "circuit"].includes(type)) {
      return res.status(400).json({ message: "Tipo inválido (line|circuit)" });
    }
    const colorOk = /^#([0-9a-fA-F]{3}){1,2}([0-9a-fA-F]{2})?$/.test(String(color || ""));
    if (!colorOk) {
      return res.status(400).json({ message: "Color inválido (HEX)" });
    }

    // Validar y normalizar points -> [[lat, lng], ...]
    if (!Array.isArray(points)) {
      return res.status(400).json({ message: "Points inválido" });
    }
    const normPoints = [];
    for (const p of points) {
      if (!Array.isArray(p) || p.length !== 2) {
        return res.status(400).json({ message: "Cada point debe ser [lat,lng]" });
      }
      const lat = Number(p[0]);
      const lng = Number(p[1]);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return res.status(400).json({ message: "Puntos inválidos (lat/lng)" });
      }
      normPoints.push([lat, lng]);
    }

    // Validar y normalizar stops -> { nombre, coordenas:[lat,lng] }
    if (!Array.isArray(stops)) {
      return res.status(400).json({ message: "Stops inválido" });
    }
    const normStops = [];
    for (const s of stops) {
      if (!s || typeof s !== "object") {
        return res.status(400).json({ message: "Stop inválido" });
      }
      const nombre = String(s.nombre || "").trim() || "Parada";
      let latLng = null;

      // Aceptar [lat,lng] (formato interno de rutas) o GeoJSON {type:'Point', coordinates:[lng,lat]}
      if (Array.isArray(s.coordenas)) {
        const lat = Number(s.coordenas[0]);
        const lng = Number(s.coordenas[1]);
        if (Number.isFinite(lat) && Number.isFinite(lng)) latLng = [lat, lng];
      } else if (s.coordenas?.type === "Point" && Array.isArray(s.coordenas?.coordinates)) {
        const [lng, lat] = s.coordenas.coordinates;
        if (Number.isFinite(lat) && Number.isFinite(lng)) latLng = [lat, lng];
      }

      if (!latLng) {
        return res.status(400).json({ message: "stop.coordenas inválido" });
      }

      normStops.push({ nombre, coordenas: latLng });
    }

    // ID duplicado
    const exists = await Ruta.findOne({ id: numId });
    if (exists) {
      return res.status(409).json({ message: `Ya existe una ruta con id ${numId}` });
    }

    // Normalizar imágenes: si no hay o no es válida, usar bus_<id>
    let finalImages = [];
    if (Array.isArray(images)) {
      finalImages = images
        .map((x) => String(x || "").trim())
        .filter((x) => x.length > 0);
    }
    if (finalImages.length === 0) {
      finalImages = [`bus_${numId}`];
    }

    const doc = await Ruta.create({
      id: numId,
      label: String(label).trim(),
      type,
      color,
      points: normPoints,
      stops: normStops,
      images: finalImages,
    });
    try {
      let upserts = 0;
      for (const s of normStops) {
        const [lat, lng] = s.coordenas;
        const geo = { type: "Point", coordinates: [lng, lat] };
        const resUp = await Stop.updateOne(
          { nombre: s.nombre, "coordenas.type": "Point", "coordenas.coordinates": [lng, lat] },
          { $setOnInsert: { nombre: s.nombre, coordenas: geo }, $addToSet: { routes: numId } },
          { upsert: true }
        );
        if (resUp.upsertedCount || resUp.modifiedCount) upserts++;
      }
      console.log(`[createRuta] stops upserted/updated: ${upserts}`);
    } catch (e) {
      console.warn("[createRuta] No se pudieron upsertar paradas en Stop:", e?.message);
    }
    return res.status(201).json({ message: "Ruta creada correctamente", id: doc.id });
  } catch (error) {
    console.error("Error al crear ruta", error);
    return res.status(500).json({ message: "Error al crear ruta" });
  }
};

export const updateRuta = async (req, res) => {
  try {
    const idParam = Number(req.params.id);
    if (!Number.isFinite(idParam)) {
      return res.status(400).json({ message: "ID inválido (numérico)" });
    }

    const { label, type, color, points = [], stops = [], images } = req.body || {};

    if (!label || !String(label).trim()) {
      return res.status(400).json({ message: "Label inválido" });
    }
    if (!["line", "circuit"].includes(type)) {
      return res.status(400).json({ message: "Tipo inválido (line|circuit)" });
    }
    const colorOk = /^#([0-9a-fA-F]{3}){1,2}([0-9a-fA-F]{2})?$/.test(String(color || ""));
    if (!colorOk) {
      return res.status(400).json({ message: "Color inválido (HEX)" });
    }

    if (!Array.isArray(points)) {
      return res.status(400).json({ message: "Points inválido" });
    }
    const normPoints = [];
    for (const p of points) {
      if (!Array.isArray(p) || p.length !== 2) {
        return res.status(400).json({ message: "Cada point debe ser [lat,lng]" });
      }
      const lat = Number(p[0]);
      const lng = Number(p[1]);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return res.status(400).json({ message: "Puntos inválidos (lat/lng)" });
      }
      normPoints.push([lat, lng]);
    }

    if (!Array.isArray(stops)) {
      return res.status(400).json({ message: "Stops inválido" });
    }
    const normStops = [];
    for (const s of stops) {
      if (!s || typeof s !== "object") {
        return res.status(400).json({ message: "Stop inválido" });
      }
      const nombre = String(s.nombre || "").trim() || "Parada";
      let latLng = null;
      if (Array.isArray(s.coordenas)) {
        const lat = Number(s.coordenas[0]);
        const lng = Number(s.coordenas[1]);
        if (Number.isFinite(lat) && Number.isFinite(lng)) latLng = [lat, lng];
      } else if (s.coordenas?.type === "Point" && Array.isArray(s.coordenas?.coordinates)) {
        const [lng, lat] = s.coordenas.coordinates;
        if (Number.isFinite(lat) && Number.isFinite(lng)) latLng = [lat, lng];
      }
      if (!latLng) {
        return res.status(400).json({ message: "stop.coordenas inválido" });
      }
      normStops.push({ nombre, coordenas: latLng });
    }

    // Construir documento de actualización
    const updateDoc = {
      label: String(label).trim(),
      type,
      color,
      points: normPoints,
      stops: normStops,
    };
    if (Array.isArray(images)) {
      const normImages = images
        .map((x) => String(x || "").trim())
        .filter((x) => x.length > 0);
      updateDoc.images = normImages.length > 0 ? normImages : [`bus_${idParam}`];
    }

    const updated = await Ruta.findOneAndUpdate(
      { id: idParam },
      updateDoc,
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Ruta no encontrada" });

    try {
      let upserts = 0;
      for (const s of normStops) {
        const [lat, lng] = s.coordenas;
        const geo = { type: "Point", coordinates: [lng, lat] };
        const resUp = await Stop.updateOne(
          { nombre: s.nombre, "coordenas.type": "Point", "coordenas.coordinates": [lng, lat] },
          { $setOnInsert: { nombre: s.nombre, coordenas: geo }, $addToSet: { routes: idParam } },
          { upsert: true }
        );
        if (resUp.upsertedCount || resUp.modifiedCount) upserts++;
      }
      console.log(`[updateRuta] stops upserted/updated: ${upserts}`);
    } catch (e) {
      console.warn("[updateRuta] No se pudieron upsertar paradas en Stop:", e?.message);
    }

    return res.json({ message: "Ruta actualizada", id: updated.id });
  } catch (error) {
    console.error("Error al actualizar ruta", error);
    return res.status(500).json({ message: "Error al actualizar ruta" });
  }
};
