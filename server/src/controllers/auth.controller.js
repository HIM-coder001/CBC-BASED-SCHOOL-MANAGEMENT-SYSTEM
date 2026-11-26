import crypto from "crypto";
import prisma from "../../prisma/client.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { success, error } from "../utils/response.js";
import { sendEmail } from "../utils/email.js";

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return error(res, "Email and password are required", 400);
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return error(res, "Invalid credentials", 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return error(res, "Invalid credentials", 401);
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return error(res, "Server configuration error", 500);
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, schoolId: user.schoolId ?? 1 },
      jwtSecret,
      { expiresIn: "7d" }
    );

    const { password: _, ...safeUser } = user;

    return success(
      res,
      {
        token,
        user: safeUser,
      },
      "Login successful"
    );
  } catch (err) {
    return error(res, err.message);
  }
};

export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return error(res, "Email required", 400);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return success(res, null, "If the email exists, a reset link was sent");

    const token = crypto.randomBytes(32).toString("hex");
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: token,
        passwordResetExpires: new Date(Date.now() + 3600000),
      },
    });

    const resetUrl = `${process.env.CLIENT_URL ?? "http://localhost:5173"}/reset-password?token=${token}`;
    await sendEmail(
      email,
      "Password Reset - SchoolHub",
      `<p>Click <a href="${resetUrl}">here</a> to reset your password. Link expires in 1 hour.</p>`,
      "password_reset"
    );

    return success(res, { devToken: process.env.NODE_ENV === "development" ? token : undefined }, "Reset instructions sent");
  } catch (err) {
    return error(res, err.message);
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return error(res, "token and password required", 400);

    const nextPassword = typeof password === "string" ? password.trim() : "";
    if (!nextPassword) return error(res, "Password is required", 400);
    if (nextPassword.length < 6) return error(res, "Password must be at least 6 characters", 400);


    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpires: { gt: new Date() },
      },
    });
    if (!user) return error(res, "Invalid or expired reset token", 400);

    const hashed = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashed,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    return success(res, null, "Password reset successful");
  } catch (err) {
    return error(res, err.message);
  }
};

export const adminResetPassword = async (req, res) => {
  try {
    const { userId, password } = req.body;
    if (!userId) return error(res, "userId required", 400);

    const newPassword = typeof password === "string" ? password.trim() : "";
    if (!newPassword) return error(res, "Password is required", 400);
    if (newPassword.length < 6) return error(res, "Password must be at least 6 characters", 400);

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: Number(userId) },
      data: { password: hashed, passwordResetToken: null, passwordResetExpires: null },
    });
    return success(res, null, "Password reset successfully");
  } catch (err) {
    if (err.code === "P2025") return error(res, "User not found", 404);
    return error(res, err.message);
  }
};