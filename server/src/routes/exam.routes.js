import express from "express";
import { getSessions, createSession, recordResult, getSessionAnalysis } from "../controllers/exam.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = express.Router();

router.get("/sessions", protect, authorize("ADMIN", "TEACHER"), getSessions);
router.post("/sessions", protect, authorize("ADMIN"), createSession);
router.post("/results", protect, authorize("ADMIN", "TEACHER"), recordResult);
router.get("/sessions/:id/analysis", protect, authorize("ADMIN", "TEACHER"), getSessionAnalysis);

export default router;
