import express from "express";
import { getLearningAreas } from "../controllers/learningArea.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protect, getLearningAreas);

export default router;
