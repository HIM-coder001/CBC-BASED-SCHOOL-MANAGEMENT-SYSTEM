import prisma from "../../prisma/client.js";
import { success, error } from "../utils/response.js";

export const createClass = async (req, res) => {
  try {
    const schoolId = req.user.schoolId;
    const { name, grade, stream } = req.body;

    const newClass = await prisma.class.create({
      data: { name, grade, stream: stream ?? "", schoolId },
      include: { students: true, teachers: true },
    });
    return success(res, newClass, "Class created");
  } catch (err) {
    return error(res, err.message);
  }
};

export const getClasses = async (req, res) => {
  try {
    const { skip, take, page, limit } = req.pagination;
    const schoolId = req.user.schoolId;

    const [classes, total] = await Promise.all([
      prisma.class.findMany({
        where: { schoolId },
        include: { students: true, teachers: true },
        skip,
        take,
        orderBy: { name: "asc" },
      }),
      prisma.class.count({ where: { schoolId } }),
    ]);
    return success(res, classes, "Classes fetched");
  } catch (err) {
    return error(res, err.message);
  }
};

export const getClassById = async (req, res) => {
  try {
    const cls = await prisma.class.findUnique({
      where: { id: Number(req.params.id) },
      include: { students: true, teachers: true },
    });
    if (!cls || cls.schoolId !== req.user.schoolId) return error(res, "Class not found", 404);
    return success(res, cls, "Class fetched successfully");
  } catch (err) {
    return error(res, err.message);
  }
};

export const updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.class.findUnique({ where: { id: Number(id) } });
    if (!existing || existing.schoolId !== req.user.schoolId) return error(res, "Class not found", 404);

    const { name, grade, stream } = req.body;
    const updated = await prisma.class.update({
      where: { id: Number(id) },
      data: {
        ...(name   && { name }),
        ...(grade  && { grade }),
        ...(stream !== undefined && { stream }),
      },
      include: { students: true, teachers: true },
    });
    return success(res, updated, "Class updated successfully");
  } catch (err) {
    if (err.code === "P2025") return error(res, "Record not found", 404);
    return error(res, err.message);
  }
};

export const deleteClass = async (req, res) => {
  try {
    const { id } = req.params;
    const cls = await prisma.class.findUnique({
      where: { id: Number(id) },
      include: { students: true },
    });
    if (!cls || cls.schoolId !== req.user.schoolId) return error(res, "Class not found", 404);
    if (cls.students.length > 0) return error(res, "Cannot delete class with enrolled students", 400);

    await prisma.class.delete({ where: { id: Number(id) } });
    return success(res, null, "Class deleted successfully");
  } catch (err) {
    return error(res, err.message);
  }
};
