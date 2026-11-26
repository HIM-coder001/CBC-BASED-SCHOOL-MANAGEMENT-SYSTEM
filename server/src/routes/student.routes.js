import express from "express";
import {
  createStudent, getStudents, getStudentById,
  updateStudent, deleteStudent, getMyStudentRecord,
} from "../controllers/student.controller.js";
import { protect }   from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { validate, schemas } from "../middleware/validate.js";

const router = express.Router();

router.get("/me", protect, authorize("STUDENT"), getMyStudentRecord);

router.post("/",   protect, authorize("ADMIN"),                        validate(schemas.createStudent), createStudent);
router.get("/",    protect, authorize("ADMIN", "TEACHER"),             getStudents);
router.get("/:id", protect, authorize("ADMIN", "TEACHER", "PARENT"),  getStudentById);
router.put("/:id", protect, authorize("ADMIN"),                        validate(schemas.updateStudent), updateStudent);
router.delete("/:id", protect, authorize("ADMIN"),                     deleteStudent);

export default router;
