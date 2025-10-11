import mongoose from "mongoose";

/* const uri = "mongodb://127.0.0.1:27017/realDB";; */
const uri = "mongodb+srv://tirsoemir84_db_user:PjIL5Im38pBoEba8@prueba.tdd8smh.mongodb.net/realDB?retryWrites=true&w=majority&appName=prueba";

export default async function connectDB() {
    try {
        await mongoose.connect(uri);
        console.log("✅ Conectado a la base de datos local");
    } catch (err) {
        console.error("❌ Error conectando a la base de datos:", err);
        process.exit(1);
    }
};
