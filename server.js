const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");
const path = require("path");

const app = express();
const port = 3000;

// URL de MongoDB (local o Docker)
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/transportes";
const client = new MongoClient(uri);

app.use(cors());

// Sirve archivos estáticos desde la carpeta Mapa-de-Rutas
const publicPath = path.join(__dirname, '..', 'Mapa-de-Rutas');
app.use(express.static(publicPath));

// Ruta raíz que sirve directamente el archivo HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(publicPath, 'Mapa2.0.html'));
});

app.get("/api/rutas", async (req, res) => {
  try {
    await client.connect();
    const db = client.db("transportes");   // nombre de tu BD en Compass
    const rutas = await db.collection("rutas").find().toArray();
    res.json(rutas);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error consultando rutas");
  }
});

app.listen(port, () => {
  console.log(`✅ Backend corriendo en http://localhost:${port}`);
});
