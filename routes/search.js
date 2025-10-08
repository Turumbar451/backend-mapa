import express from "express";
import { unifiedSearch } from "../controllers/searchController.js";

const router = express.Router();

// GET /api/search/unified?q=termino
router.get("/unified", unifiedSearch);

export default router;