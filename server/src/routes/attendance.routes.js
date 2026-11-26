import express from "express";
import {
  createAttendance, getStudentAttendance, getClassAttendance,
  updateAttendance, deleteAttendance, getAttendanceReport,
} from "../controllers/attendance.controller.js";
import { protect }   from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { validate, schemas } from "../middleware/validate.js";

const router = express.Router();

router.post("/",                    protect, authorize("ADMIN", "TEACHER"), validate(schemas.createAttendance), createAttendance);
router.get("/student/:studentId",   protect, getStudentAttendance);
router.get("/class/:classId",       protect, authorize("ADMIN", "TEACHER"), getClassAttendance);
router.get("/report",               protect, authorize("ADMIN", "TEACHER"), getAttendanceReport);
router.put("/:id",                  protect, authorize("ADMIN", "TEACHER"), validate(schemas.updateAttendance), updateAttendance);
router.delete("/:id",               protect, authorize("ADMIN", "TEACHER"), deleteAttendance);

export default router;
