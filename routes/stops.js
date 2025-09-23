import express from "express";
import { nearbyStops, searchStopsByName } from "../controllers/stopsController.js";

const router = express.Router();

router.get("/nearby", nearbyStops);
 
// cambios negro
router.get("/search", searchStopsByName);

export default router;
