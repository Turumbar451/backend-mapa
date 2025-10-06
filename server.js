// server.js 
// arranca el servidor y conecta las rutas
import stopsRoutes from "./routes/stops.js";
import express from 'express'; //framework para crear servidor web
import cors from 'cors'; //para permitir solicitudes desde el frontend, por defecto bloqueados,es un mliddleware. 
import cookieParser from "cookie-parser";
// un middleware es una funcion que se ejecuta entre la peticion y la respuesta, puede modificar la solicitud(req) o la respuesta(res)
import rutasRouter from './routes/rutas.js';
import authRoutes from "./routes/auth.js";
import connectDB from "./db.js";

import mongoose from "mongoose";
mongoose.connection.once("open", () => {
  console.log("[Mongo] conectado a", mongoose.connection.host, mongoose.connection.name);
});

const app = express(); // inicializa servidor express, app es una instancia del servidor, o se objeto con metodos
//use es un metodo para usar middlewares
async function startServer() {
  await connectDB();
  app.use(express.json()); // para parsear JSON en el body
  //sin express.json() no se podria leer req.body, este es un middleware que convierte el body de la solicitud en un objeto JS, por eso se usa use 


  app.use(cookieParser());//la peticion http tiene cookies y este middleware las parsea y las pone en req.cookies

  const allowedOrigins = [
    "http://localhost:4321", // desarrollo local
    "https://rutasxalapa.netlify.app" // frontend desplegado
  ];

  app.use(cors({
    origin: function (origin, callback) {
      // permitir requests sin origin (ej. Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("No permitido por CORS"));
      }
    },
    credentials: true, // permitir cookies
  }));
  //aplica cors a todas las rutas,

  app.use("/api/stops", stopsRoutes);
  // las rutas basicamente son endpoints, urls a las que el frontend puede hacer fetch
  app.use("/api", authRoutes); //todo lo que llegue a /api lo maneja authRoutes o sesa auth.js
  app.use('/api/rutas', rutasRouter);

  const PORT = 3000;
  //listen inicializa el servidor, tiene un puerto y un callback
  app.listen(PORT, () => {
    console.log(`Backend corriendo en http://localhost:${PORT}`);
  });
}

startServer();