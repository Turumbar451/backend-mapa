import mongoose from "mongoose";

const siteSchema = new mongoose.Schema(
    {
        name: {type: String, required: true, index: true},
        route_ids: {type: [Number], default: []},
    },
    {collection: "sites"}
);

// Modelo inline para Sites (evita crear archivos nuevos)
export default mongoose.models.Site || mongoose.model("Site", siteSchema);