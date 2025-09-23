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

/* //controllers/rutasController.js
//leera el json y decidira que devolver al frontend
import fs from 'fs'; //modulo nativo de note para ler archivos (el file system)
import path from 'path'; //modulo nativo de node para manejar rutas de archivos

const rutasPath = path.resolve('./data/rutas.json'); //convierte ruta relativa en ruta absoluta

export const getRutas = (req, res) => {
    const rutas = JSON.parse(fs.readFileSync(rutasPath, 'utf-8'));
    res.json(rutas);
};
//readFileSync lee el archivo de forma sincrona, o sea bloquea
//tiene dos parametros, la ruta y la codificacion
//json.parse convierte el string json en un objeto de JS porque utf-8 es un string
//res.json convierte el ojeto js en un json y lo manda al frontend */