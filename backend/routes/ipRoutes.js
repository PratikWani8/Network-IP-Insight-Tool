import express from "express";
import { lookupIP } from "../controllers/ipController.js";

const router = express.Router();

router.get("/lookup", lookupIP);

export default router;
