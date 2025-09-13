// routes/rutas.js
//definira endpoints (URLs a los que el frontend puede hacer fetch)

import express from 'express';
import { getRutas } from '../controllers/rutasController.js';

const router = express.Router();//crear router de express, es un mini servidor dentro del servidor que sirve para definir endpoints

router.get('/', getRutas); //definimos un endpoint get en la raiz del router, que llama a la funcion getRutas del controlador

export default router; //exportamos el router para usarlo en el servidor principal (index.js)
