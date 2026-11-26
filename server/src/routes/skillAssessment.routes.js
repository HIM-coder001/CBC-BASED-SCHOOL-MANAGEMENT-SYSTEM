import express from "express";
import {
  createSkillAssessment,
  getByCompetency,
  updateSkillAssessment,
  deleteSkillAssessment,
} from "../controllers/skillAssessment.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = express.Router();

router.post("/", protect, authorize("ADMIN", "TEACHER"), createSkillAssessment);
router.get("/competency/:competencyId", protect, authorize("ADMIN", "TEACHER", "STUDENT", "PARENT"), getByCompetency);
router.put("/:id", protect, authorize("ADMIN", "TEACHER"), updateSkillAssessment);
router.delete("/:id", protect, authorize("ADMIN", "TEACHER"), deleteSkillAssessment);

export default router;
