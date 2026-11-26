import express from "express";
import {
  createLearnerProfile, getLearnerProfiles,
  updateLearnerProfile, deleteLearnerProfile,
} from "../controllers/learnerProfile.controller.js";
import { protect }   from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { validate, schemas } from "../middleware/validate.js";

const router = express.Router();

router.post("/",  protect, authorize("ADMIN", "TEACHER"), validate(schemas.createLearnerProfile), createLearnerProfile);
router.get("/",   protect,                                getLearnerProfiles);
router.put("/:id",protect, authorize("ADMIN", "TEACHER"), updateLearnerProfile);
router.delete("/:id", protect, authorize("ADMIN", "TEACHER"), deleteLearnerProfile);

export default router;
