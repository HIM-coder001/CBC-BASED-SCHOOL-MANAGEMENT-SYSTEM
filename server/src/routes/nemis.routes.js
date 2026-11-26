import express from "express";
import { exportStudents, exportTeachers, updateNemisUpi } from "../controllers/nemis.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = express.Router();

router.get("/export/students", protect, authorize("ADMIN"), exportStudents);
router.get("/export/teachers", protect, authorize("ADMIN"), exportTeachers);
router.put("/upi", protect, authorize("ADMIN"), updateNemisUpi);

export default router;
