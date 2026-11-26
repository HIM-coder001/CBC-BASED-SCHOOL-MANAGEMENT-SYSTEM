import express from "express";
import { createUser, getUsers, getUserById, updateUser, deleteUser } from "../controllers/user.controller.js";
import { protect }   from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { validate, schemas } from "../middleware/validate.js";

const router = express.Router();

router.post("/",   protect, authorize("ADMIN"), validate(schemas.createUser), createUser);
router.get("/",    protect, authorize("ADMIN"), getUsers);
router.get("/:id", protect, authorize("ADMIN"), getUserById);
router.put("/:id", protect, authorize("ADMIN"), validate(schemas.updateUser), updateUser);
router.delete("/:id", protect, authorize("ADMIN"), deleteUser);

export default router;
