import prisma from "../../prisma/client.js";
import { success, error } from "../utils/response.js";

export const createTeacher = async (req, res) => {
  try {
    const schoolId = req.user.schoolId;
    const { tscNo, fullName, email, phone, subject, userId, classId, nemisUpi } = req.body;

    const teacher = await prisma.teacher.create({
      data: {
        tscNo,
        fullName,
        email,
        phone,
        subject,
        schoolId,
        userId: Number(userId),
        ...(classId  ? { classId: Number(classId) } : {}),
        ...(nemisUpi ? { nemisUpi }                 : {}),
      },
      include: { user: true, class: true },
    });
    return success(res, teacher, "Teacher created successfully");
  } catch (err) {
    if (err.code === "P2002") {
      const field = err.meta?.target?.includes("tscNo") ? "TSC number" : "email";
      return error(res, `A teacher with this ${field} already exists`, 400);
    }
    return error(res, err.message);
  }
};

export const getTeachers = async (req, res) => {
  try {
    const { page = 1, limit = 50, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const schoolId = req.user.schoolId;

    const where = { schoolId, ...(search && {
      OR: [
        { fullName: { contains: search } },
        { tscNo:    { contains: search } },
        { subject:  { contains: search } },
      ],
    }) };

    const [teachers, total] = await Promise.all([
      prisma.teacher.findMany({
        where,
        include: { user: true, class: true },
        skip,
        take: Number(limit),
        orderBy: { fullName: "asc" },
      }),
      prisma.teacher.count({ where }),
    ]);
    return success(res, { teachers, total, page: Number(page), limit: Number(limit) }, "Teachers fetched successfully");
  } catch (err) {
    return error(res, err.message);
  }
};

export const getTeacherById = async (req, res) => {
  try {
    const teacher = await prisma.teacher.findUnique({
      where: { id: Number(req.params.id) },
      include: { user: true, class: true },
    });
    if (!teacher || teacher.schoolId !== req.user.schoolId) return error(res, "Teacher not found", 404);
    return success(res, teacher, "Teacher fetched successfully");
  } catch (err) {
    return error(res, err.message);
  }
};

export const updateTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.teacher.findUnique({ where: { id: Number(id) } });
    if (!existing || existing.schoolId !== req.user.schoolId) return error(res, "Teacher not found", 404);

    const { tscNo, fullName, email, phone, subject, classId, nemisUpi } = req.body;
    const updated = await prisma.teacher.update({
      where: { id: Number(id) },
      data: {
        ...(tscNo    && { tscNo }),
        ...(fullName && { fullName }),
        ...(email    && { email }),
        ...(phone    && { phone }),
        ...(subject  && { subject }),
        ...(classId  !== undefined ? { classId: classId ? Number(classId) : null } : {}),
        ...(nemisUpi !== undefined && { nemisUpi }),
      },
      include: { user: true, class: true },
    });
    return success(res, updated, "Teacher updated successfully");
  } catch (err) {
    if (err.code === "P2025") return error(res, "Record not found", 404);
    if (err.code === "P2002") return error(res, "TSC number or email already in use", 400);
    return error(res, err.message);
  }
};

export const deleteTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.teacher.findUnique({ where: { id: Number(id) } });
    if (!existing || existing.schoolId !== req.user.schoolId) return error(res, "Teacher not found", 404);

    await prisma.teacher.delete({ where: { id: Number(id) } });
    return success(res, null, "Teacher deleted successfully");
  } catch (err) {
    if (err.code === "P2025") return error(res, "Record not found", 404);
    return error(res, err.message);
  }
};
