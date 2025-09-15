import mongoose from "mongoose";

await mongoose.connect("mongodb://localhost:27017/realDB");

// Modelo de rutas
const RouteSchema = new mongoose.Schema({
    id: Number,
    label: String,
    stops: [
        {
            nombre: String,
            coordenas: [Number],
        },
    ],
}, { collection: "rutas" }); // <--- colección correcta

// Modelo de paradas
const StopSchema = new mongoose.Schema({
    nombre: String,
    coordenas: { type: { type: String }, coordinates: [Number] },
    routes: [Number],
});

StopSchema.index({ coordenas: "2dsphere" });

const Route = mongoose.model("Route", RouteSchema);
const Stop = mongoose.model("Stop", StopSchema);

async function migrateStops() {
    const routes = await Route.find();
    const stopMap = new Map();

    routes.forEach(route => {
        route.stops.forEach(stop => {
            const key = stop.nombre;
            if (!stopMap.has(key)) {
                stopMap.set(key, {
                    nombre: stop.nombre,
                    coordenas: { type: "Point", coordinates: [stop.coordenas[1], stop.coordenas[0]] },
                    routes: [route.id],
                });
            } else {
                stopMap.get(key).routes.push(route.id);
            }
        });
    });

    for (const stop of stopMap.values()) {
        await Stop.create(stop);
    }

    console.log("Migración completada. Paradas únicas creadas:", stopMap.size);
    mongoose.disconnect();
}

migrateStops().catch(err => console.error(err));
