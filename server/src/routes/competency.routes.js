import express from "express";
import {
  createCompetency, getStudentCompetencies, updateCompetency,
  deleteCompetency, getCompetencyReport,
} from "../controllers/competency.controller.js";
import { protect }   from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { validate, schemas } from "../middleware/validate.js";

const router = express.Router();

router.post("/",                  protect, authorize("ADMIN", "TEACHER"), validate(schemas.createCompetency), createCompetency);
router.get("/student/:studentId", protect,                                getStudentCompetencies);
router.get("/report",             protect, authorize("ADMIN", "TEACHER"), getCompetencyReport);
router.put("/:id",                protect, authorize("ADMIN", "TEACHER"), updateCompetency);
router.delete("/:id",             protect, authorize("ADMIN", "TEACHER"), deleteCompetency);

export default router;
