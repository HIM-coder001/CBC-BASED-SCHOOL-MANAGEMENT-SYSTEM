import express from "express";
import { createAssessment, getAssessments, updateAssessment, deleteAssessment, bulkCreateAssessments } from "../controllers/assesment.controller.js";
import { protect }   from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { validate, schemas } from "../middleware/validate.js";

const router = express.Router();

router.post("/bulk", protect, authorize("ADMIN", "TEACHER"), validate(schemas.bulkCreateAssessments), bulkCreateAssessments);
router.post("/",     protect, authorize("ADMIN", "TEACHER"), validate(schemas.createAssessment),      createAssessment);
router.get("/",      protect, authorize("ADMIN", "TEACHER", "STUDENT"),                               getAssessments);
router.put("/:id",   protect, authorize("ADMIN", "TEACHER"),                                          updateAssessment);
router.delete("/:id",protect, authorize("ADMIN"),                                                     deleteAssessment);

export default router;
