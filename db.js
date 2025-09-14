import mongoose from "mongoose";

const uri = "mongodb://127.0.0.1:27017/realDB";

export default async function connectDB() {
    try {
        await mongoose.connect(uri);
        console.log("✅ Conectado a la base de datos local");
    } catch (err) {
        console.error("❌ Error conectando a la base de datos:", err);
        process.exit(1);
    }
};

