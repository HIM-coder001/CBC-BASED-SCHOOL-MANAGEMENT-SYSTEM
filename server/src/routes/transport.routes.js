import express from "express";
import {
  getRoutes, createRoute, createDriver, createVehicle, assignStudentRoute, getDrivers, getVehicles,
} from "../controllers/transport.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = express.Router();

router.get("/routes", protect, authorize("ADMIN", "TEACHER"), getRoutes);
router.post("/routes", protect, authorize("ADMIN"), createRoute);
router.get("/drivers", protect, authorize("ADMIN"), getDrivers);
router.post("/drivers", protect, authorize("ADMIN"), createDriver);
router.get("/vehicles", protect, authorize("ADMIN"), getVehicles);
router.post("/vehicles", protect, authorize("ADMIN"), createVehicle);
router.post("/assign", protect, authorize("ADMIN"), assignStudentRoute);

export default router;
