import express from "express";
import { getDashboardStats, getClassPerformance, getAuditLogs } from "../controllers/analytics.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = express.Router();

router.get("/dashboard", protect, authorize("ADMIN", "TEACHER"), getDashboardStats);
router.get("/class-performance", protect, authorize("ADMIN", "TEACHER"), getClassPerformance);
router.get("/audit", protect, authorize("ADMIN"), getAuditLogs);

export default router;
