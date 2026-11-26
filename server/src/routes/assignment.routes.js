import express from "express";
import {
  createAssignment, getAssignments, getStudentAssignments,
  submitAssignment, gradeAssignment, updateAssignment,
  deleteAssignment, getAssignmentStats,
} from "../controllers/assignment.controller.js";
import { protect }   from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { validate, schemas } from "../middleware/validate.js";
import { upload } from "../middleware/upload.middleware.js";

const router = express.Router();

router.post("/",                              protect, authorize("ADMIN", "TEACHER"), validate(schemas.createAssignment), createAssignment);
router.get("/",                               protect, getAssignments);
router.get("/student/:studentId",             protect, getStudentAssignments);
router.get("/:assignmentId/stats",            protect, authorize("ADMIN", "TEACHER"), getAssignmentStats);
router.put("/:assignmentId/submit/:studentId",protect, authorize("STUDENT", "PARENT"), upload.single("file"), submitAssignment);
router.put("/:assignmentId/grade/:studentId", protect, authorize("ADMIN", "TEACHER"), gradeAssignment);
router.put("/:id",                            protect, authorize("ADMIN", "TEACHER"), updateAssignment);
router.delete("/:id",                         protect, authorize("ADMIN", "TEACHER"), deleteAssignment);

export default router;
