import express from "express";
import {
  createTeacher, getTeachers, getTeacherById,
  updateTeacher, deleteTeacher,
} from "../controllers/teacher.controller.js";
import { protect }   from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { validate, schemas } from "../middleware/validate.js";

const router = express.Router();

router.post("/",   protect, authorize("ADMIN"), validate(schemas.createTeacher), createTeacher);
router.get("/",    protect,                     getTeachers);
router.get("/:id", protect,                     getTeacherById);
router.put("/:id", protect, authorize("ADMIN"), validate(schemas.updateTeacher), updateTeacher);
router.delete("/:id", protect, authorize("ADMIN"), deleteTeacher);

export default router;
