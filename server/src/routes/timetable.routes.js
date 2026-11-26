import express from "express";
import { getSubjects, createSubject, getTimetable, createSlot, deleteSlot } from "../controllers/timetable.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = express.Router();

router.get("/subjects", protect, getSubjects);
router.post("/subjects", protect, authorize("ADMIN"), createSubject);
router.get("/", protect, authorize("ADMIN", "TEACHER", "STUDENT"), getTimetable);
router.post("/", protect, authorize("ADMIN"), createSlot);
router.delete("/:id", protect, authorize("ADMIN"), deleteSlot);

export default router;
