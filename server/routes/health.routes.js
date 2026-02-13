import express from "express";
import { healthCheck, getComponentStatus } from "../controller/health.controller.js";

const router = express.Router();

router.get("/health", healthCheck);
router.get("/health/:component", getComponentStatus);

export default router;
