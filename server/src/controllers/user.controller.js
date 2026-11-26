import prisma from "../../prisma/client.js";
import { success, error } from "../utils/response.js";
import bcrypt from "bcryptjs";

export const createUser = async (req, res) => {
  try {
    const schoolId = req.user.schoolId;
    const { fullName, email, password, role } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return error(res, "Email already exists", 400);

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { fullName, email, password: hashedPassword, role, schoolId },
      select: { id: true, fullName: true, email: true, role: true, createdAt: true },
    });
    return success(res, user, "User created successfully");
  } catch (err) {
    if (err.code === "P2002") return error(res, "Email already exists", 400);
    return error(res, err.message);
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { schoolId: req.user.schoolId },
      select: { id: true, fullName: true, email: true, role: true, createdAt: true, updatedAt: true },
    });
    return success(res, users, "Users fetched successfully");
  } catch (err) {
    return error(res, err.message);
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(req.params.id) },
      select: { id: true, fullName: true, email: true, role: true, schoolId: true, createdAt: true, updatedAt: true },
    });
    if (!user || user.schoolId !== req.user.schoolId) return error(res, "User not found", 404);
    return success(res, user, "User fetched successfully");
  } catch (err) {
    return error(res, err.message);
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.user.findUnique({ where: { id: Number(id) } });
    if (!existing || existing.schoolId !== req.user.schoolId) return error(res, "User not found", 404);

    const { fullName, email, role, password } = req.body;
    const updateData = {};
    if (fullName) updateData.fullName = fullName;
    if (email)    updateData.email    = email;
    if (role)     updateData.role     = role;
    if (password) updateData.password = await bcrypt.hash(password, 10);

    const updated = await prisma.user.update({
      where: { id: Number(id) },
      data: updateData,
      select: { id: true, fullName: true, email: true, role: true, updatedAt: true },
    });
    return success(res, updated, "User updated successfully");
  } catch (err) {
    if (err.code === "P2002") return error(res, "Email already exists", 400);
    if (err.code === "P2025") return error(res, "User not found", 404);
    return error(res, err.message);
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.user.findUnique({ where: { id: Number(id) } });
    if (!existing || existing.schoolId !== req.user.schoolId) return error(res, "User not found", 404);

    await prisma.user.delete({ where: { id: Number(id) } });
    return success(res, null, "User deleted successfully");
  } catch (err) {
    if (err.code === "P2025") return error(res, "User not found", 404);
    return error(res, err.message);
  }
};
