import express from "express";
import { nearbyStops } from "../controllers/stopsController.js";

const router = express.Router();

router.get("/nearby", nearbyStops);

export default router;
