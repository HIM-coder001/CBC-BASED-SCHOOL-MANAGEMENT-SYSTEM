import express from "express";
import { login, requestPasswordReset, resetPassword, adminResetPassword } from "../controllers/auth.controller.js";
import { protect }   from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { validate, schemas } from "../middleware/validate.js";

const router = express.Router();

router.post("/login",               validate(schemas.login),               login);
router.post("/forgot-password",     validate(schemas.forgotPassword),      requestPasswordReset);
router.post("/reset-password",      validate(schemas.resetPassword),       resetPassword);
router.post("/admin-reset-password",protect, authorize("ADMIN"),           validate(schemas.adminResetPassword), adminResetPassword);

export default router;
