import express from "express";
import { getAuditLogs } from "../controllers/auditLogController.js";
import { adminAuth } from "../middlewares/adminAuth.js";

const router = express.Router();

router.get("/", adminAuth, getAuditLogs);

export default router;
