import express from "express";
import {
  getDisciplineRecords, createDisciplineRecord, getEvents, createEvent, deleteDisciplineRecord,
} from "../controllers/discipline.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = express.Router();

router.get("/records", protect, authorize("ADMIN", "TEACHER"), getDisciplineRecords);
router.post("/records", protect, authorize("ADMIN", "TEACHER"), createDisciplineRecord);
router.delete("/records/:id", protect, authorize("ADMIN"), deleteDisciplineRecord);
router.get("/events", protect, getEvents);
router.post("/events", protect, authorize("ADMIN"), createEvent);

export default router;
