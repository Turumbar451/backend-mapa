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
import trafficRoutes from "./routes/traffic.js";
import sitesRoutes from "./routes/sites.js";
import searchRoutes from "./routes/search.js";
import prefsRoutes from "./routes/prefs.js";

import mongoose from "mongoose";
mongoose.connection.once("open", () => {
  console.log("[Mongo] conectado a", mongoose.connection.host, mongoose.connection.name);
});

const app = express(); // inicializa servidor express, app es una instancia del servidor, o se objeto con metodos
//use es un metodo para usar middlewares
async function startServer() {
  await connectDB();
  app.set('trust proxy', 1);
  app.use(express.json()); // para parsear JSON en el body
  //sin express.json() no se podria leer req.body, este es un middleware que convierte el body de la solicitud en un objeto JS, por eso se usa use 


  app.use(cookieParser());//la peticion http tiene cookies y este middleware las parsea y las pone en req.cookies

  const allowedOrigins = [
    "http://localhost:4321",
    "https://rutasxalapa.netlify.app",
    "https://frontend-mapa.netlify.app"
  ];

  app.use(cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // Postman o SSR
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("No permitido por CORS"));
    },
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE", // [MODIFICACIÓN] Asegurar que POST esté explícitamente permitido
    credentials: true,
    optionsSuccessStatus: 200, // [MODIFICACIÓN] Devolver 200 en lugar de 204 para asegurar que los navegadores IE/Edge más antiguos lo acepten, y ser más explícitos en general.
  }));

  //aplica cors a todas las rutas,

  app.use("/api/stops", stopsRoutes);
  // las rutas basicamente son endpoints, urls a las que el frontend puede hacer fetch
  app.use("/api", authRoutes); //todo lo que llegue a /api lo maneja authRoutes o sesa auth.js
  app.use('/api/rutas', rutasRouter);
  app.use('/api/traffic', trafficRoutes);
  app.use('/api/sites', sitesRoutes);
  app.use('/api/search', searchRoutes);
  app.use('/api/user', prefsRoutes);

  // Health check para Railway/monitoring
  app.get('/api/health', (req, res) => res.json({ ok: true }));

  const PORT = process.env.PORT || 3000; // puerto del servidor, si hay una variable de entorno PORT la usa, sino usa 4321
  const HOST = '0.0.0.0';
  //listen inicializa el servidor, tiene un puerto y un callback
  app.listen(PORT, HOST, () => {
    console.log(`Backend corriendo en http://${HOST}:${PORT}`);
  });
}

startServer();
