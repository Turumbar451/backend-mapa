//controllers/rutasController.js
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
//res.json convierte el ojeto js en un json y lo manda al frontend