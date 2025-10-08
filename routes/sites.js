import express from "express";
import { searchSitesByName, compareSitesByName } from "../controllers/sitesController.js";

const router = express.Router();

// GET /api/sites/search?nombre=Texto
router.get("/search", searchSitesByName);

// GET /api/sites/compare?nombreA=...&nombreB=...
// Aliases: a, b
router.get("/compare", compareSitesByName);

export default router;