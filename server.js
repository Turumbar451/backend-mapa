// server.js 
// arranca el servidor y conecta las rutas
import express from 'express';
import rutasRouter from './routes/rutas.js';

const app = express();
app.use(express.json());

// todos los endpoints relacionados con rutas comienzan con /api/rutas
app.use('/api/rutas', rutasRouter);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
