// backend/scripts/exportToFrontend.js
import fs from 'fs';
import path from 'path';

// ruta del JSON en el backend
const backendRutasPath = path.resolve('./data/rutas.json');

// ruta de destino en el frontend
const frontendRutasPath = path.resolve('../frontend/src/data/rutas.json');

// leer JSON del backend
const rutas = JSON.parse(fs.readFileSync(backendRutasPath, 'utf-8'));

// escribir JSON en el frontend
fs.writeFileSync(frontendRutasPath, JSON.stringify(rutas, null, 2));

console.log('rutas.json copiado al frontend ✅');
