import express from "express";
import { resolveDNS } from "../controllers/dnsController.js";

const router = express.Router();

router.get("/resolve", resolveDNS);

export default router;
