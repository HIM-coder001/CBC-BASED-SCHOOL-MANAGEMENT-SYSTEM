import express from "express";
import { getSchools, createSchool, getNotificationLogs } from "../controllers/school.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = express.Router();

router.get("/", protect, authorize("ADMIN"), getSchools);
router.post("/", protect, authorize("ADMIN"), createSchool);
router.get("/notifications", protect, authorize("ADMIN"), getNotificationLogs);

export default router;
