import express from "express";
import { getReportCards, generateReportCard } from "../controllers/reportCard.controller.js";
import { protect }   from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { validate, schemas } from "../middleware/validate.js";

const router = express.Router();

router.post("/generate", protect, authorize("ADMIN", "TEACHER"), validate(schemas.generateReportCard), generateReportCard);
router.get("/",          protect, authorize("ADMIN", "TEACHER", "STUDENT"),                            getReportCards);

export default router;
