import express from "express";
import { getSubmissions, upsertSubmission, reviewSubmission } from "../controllers/tpad.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = express.Router();

router.get("/", protect, authorize("ADMIN", "TEACHER"), getSubmissions);
router.post("/", protect, authorize("ADMIN", "TEACHER"), upsertSubmission);
router.put("/:id/review", protect, authorize("ADMIN"), reviewSubmission);

export default router;
