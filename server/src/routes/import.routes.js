import express from "express";
import { importStudents, importTeachers, getImportJobs } from "../controllers/import.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { uploadExcel } from "../middleware/upload.middleware.js";

const router = express.Router();

router.post("/students", protect, authorize("ADMIN"), uploadExcel.single("file"), importStudents);
router.post("/teachers", protect, authorize("ADMIN"), uploadExcel.single("file"), importTeachers);
router.get("/jobs", protect, authorize("ADMIN"), getImportJobs);

export default router;
