// server.js 
// arranca el servidor y conecta las rutas
import express from 'express'; //framework para crear servidor web
import cors from 'cors'; //para permitir solicitudes desde el frontend, por defecto bloqueados,es un mliddleware. 
// un middleware es una funcion que se ejecuta entre la peticion y la respuesta, puede modificar la solicitud(req) o la respuesta(res)
import rutasRouter from '../backend/routes/rutas.js';
import authRoutes from "./routes/auth.js";

const app = express(); // inicializa servidor express, app es una instancia del servidor, o se objeto con metodos
//use es un metodo para usar middlewares
app.use(cors()); //aplica cors a todas las rutas,
app.use(express.json()); // para parsear JSON en el body
//sin express.json() no se podria leer req.body, este es un middleware que convierte el body de la solicitud en un objeto JS, por eso se usa use 

// las rutas basicamente son endpoints, urls a las que el frontend puede hacer fetch
app.use("/api", authRoutes);
app.use('/api/rutas', rutasRouter);

//app.get define una ruta GET, recibe la ruta y un callback con req y res
app.get('/', (req, res) => {
  res.send('Backend corriendo');
});


const PORT = 3000;
//listen inicializa el servidor, tiene un puerto y un callback
app.listen(PORT, () => {
  console.log(`Backend corriendo en http://localhost:${PORT}`);
});
