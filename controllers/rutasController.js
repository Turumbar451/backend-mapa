import Ruta from "../models/ruta.js";
import mongoose from "mongoose";

export const getListadoRutas = async (req, res) => {
  try {
    // Opcional: incluye también el id numérico si te sirve en el front
    const rutas = await Ruta.find({}, "_id id label");
    res.json(rutas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al cargar listado de rutas" });
  }
};

export const getTodasRutas = async (req, res) => {
  try {
    const rutas = await Ruta.find({});
    res.json(rutas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al cargar rutas completas" });
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

// NUEVO: DELETE por _id de Mongo o por id numérico
export const deleteRuta = async (req, res) => {
  try {
    const { id } = req.params;

    let deleted = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      // Borrar por _id (lo que actualmente manda tu frontend)
      deleted = await Ruta.findByIdAndDelete(id);
    } else {
      // Intentar borrar por id numérico (coherente con tu GET /:id)
      const num = Number(id);
      if (Number.isNaN(num)) {
        return res.status(400).json({ message: "ID inválido" });
      }
      deleted = await Ruta.findOneAndDelete({ id: num });
    }

    if (!deleted) {
      return res.status(404).json({ message: "Ruta no encontrada" });
    }

    return res.json({ message: "Ruta eliminada correctamente" });
  } catch (err) {
    console.error("DELETE /rutas/:id error", err);
    return res.status(500).json({ message: "Error eliminando ruta" });
  }
};

export const createRuta = async (req, res) => {
    try {
      const{
        id,
        label,
        type, 
        color,
        points = [],
        stops = []
      } = req.body || {};

      //validaciones :d
      const numID = Number(id);
      if (!Number.isFinite(numID)){
        return res.status(400).json({message: "ID inválido"})
      }
      if (!label || !String(label).trim()){
        return res.status(400).json({message: "Label inválido"})
      }
      if (!["line", "circuit"].includes(type)){
        return res.status(400).json({message: "Tipo inválido"})
      }
      const colorOk = /^#([0-9a-fA-F]{3}){1,2}([0-9a-fA-F]{2})?$/.test(String(color || ""));
      if (!colorOK){
        return res.status(400).json({message: "Color inválido"})
      }
      // Validar points
      if (!Array.isArray(points)){
        return res.status(400).json({message: "Points inválido"})
      }
      const normPoints = [];
      for (const p of points){
        if (!Array.isArray(p) || p.length !==2){
          return res.status(400).json({message: "Points inválido" })
        }
      }
      
      
      
    } catch (error) {
        
    }
}