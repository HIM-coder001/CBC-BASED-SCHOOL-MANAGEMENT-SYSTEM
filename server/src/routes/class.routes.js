import express from "express";
import { createClass, getClasses, getClassById, updateClass, deleteClass } from "../controllers/class.controller.js";
import { protect }   from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { validate, schemas } from "../middleware/validate.js";
import { paginate } from "../middleware/paginate.js";

const router = express.Router();

router.post("/",   protect, authorize("ADMIN"),           validate(schemas.createClass), createClass);
router.get("/",    protect, authorize("ADMIN", "TEACHER"), paginate({ defaultLimit: 100 }), getClasses);
router.get("/:id", protect, authorize("ADMIN", "TEACHER"), getClassById);
router.put("/:id", protect, authorize("ADMIN"),            validate(schemas.updateClass), updateClass);
router.delete("/:id", protect, authorize("ADMIN"),         deleteClass);

export default router;
