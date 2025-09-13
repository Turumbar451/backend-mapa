// routes/rutas.js
//definira endpoints (URLs a los que el frontend puede hacer fetch)

import express from 'express';
import { getAllRutas, getRutaById } from '../controllers/rutasController.js';

const router = express.Router();

// obtener todas las rutas
router.get('/', getAllRutas);

// obtener una ruta por ID
router.get('/:id', getRutaById);

export default router;
