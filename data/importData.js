import fs from "fs";
import Ruta from "./ruta.js";
import Usuario from "./usuario.js";
import mongoose from "mongoose";

const rutas = JSON.parse(fs.readFileSync("./data/rutas.json", "utf-8")).map(r => {
    const { _id, ...rest } = r; // elimina _id
    return rest;
});


const usuarios = JSON.parse(fs.readFileSync("./data/usuarios.json", "utf-8"));

const uri = "mongodb+srv://tirsoemir84_db_user:5bMYjLhTfPVXuBgw@prueba.tdd8smh.mongodb.net/realDB?retryWrites=true&w=majority&appName=prueba";

async function importData() {
    try {


        await mongoose.connect(uri);
        console.log("✅ Conectado a MongoDB Atlas");

        await Ruta.deleteMany();
        await Usuario.deleteMany();

        await Ruta.insertMany(rutas);
        await Usuario.insertMany(usuarios);

        console.log("📌 Datos importados correctamente");
        process.exit();
    } catch (err) {
        console.error("❌ Error importando:", err);
        process.exit(1);
    }
}

importData();
