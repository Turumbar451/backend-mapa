//controllers/rutasController.js
//leera el json y decidira que devolver al frontend

import fs from 'fs';
import path from 'path';

const rutasPath = path.resolve('./data/rutas.json');
const rutas = JSON.parse(fs.readFileSync(rutasPath, 'utf-8'));

// devuelve todas las rutas
export function getAllRutas(req, res) {
    res.json(rutas);
}

// devuelve una ruta por ID
export function getRutaById(req, res) {
    const { id } = req.params;
    const ruta = rutas.find(r => r.id === id);
    if (!ruta) return res.status(404).json({ error: 'Ruta no encontrada' });
    res.json(ruta);
}
