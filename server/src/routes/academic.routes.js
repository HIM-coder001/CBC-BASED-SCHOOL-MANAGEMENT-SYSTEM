import express from "express";
import { getAcademicYears, createAcademicYear, createTerm, lockTerm } from "../controllers/academic.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = express.Router();

router.get("/years", protect, authorize("ADMIN", "TEACHER"), getAcademicYears);
router.post("/years", protect, authorize("ADMIN"), createAcademicYear);
router.post("/terms", protect, authorize("ADMIN"), createTerm);
router.put("/terms/:id/lock", protect, authorize("ADMIN"), lockTerm);

export default router;
