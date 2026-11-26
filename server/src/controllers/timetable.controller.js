import prisma from "../../prisma/client.js";
import { success, error } from "../utils/response.js";

export const getSubjects = async (req, res) => {
  try {
    const subjects = await prisma.subject.findMany({ orderBy: { name: "asc" } });
    return success(res, subjects, "Subjects fetched");
  } catch (err) {
    return error(res, err.message);
  }
};

export const createSubject = async (req, res) => {
  try {
    const { name, code, grade } = req.body;
    if (!name) return error(res, "name required", 400);
    const s = await prisma.subject.create({ data: { name, code, grade } });
    return success(res, s, "Subject created");
  } catch (err) {
    return error(res, err.message);
  }
};

export const getTimetable = async (req, res) => {
  try {
    const { classId, teacherId } = req.query;
    const where = {};
    if (classId) where.classId = Number(classId);
    if (teacherId) where.teacherId = Number(teacherId);

    const slots = await prisma.timetableSlot.findMany({
      where,
      include: { class: true, teacher: true, subject: true },
      orderBy: [{ dayOfWeek: "asc" }, { period: "asc" }],
    });
    return success(res, slots, "Timetable fetched");
  } catch (err) {
    return error(res, err.message);
  }
};

export const createSlot = async (req, res) => {
  try {
    const { dayOfWeek, period, room, classId, teacherId, subjectId } = req.body;
    if (!dayOfWeek || !period || !classId || !teacherId || !subjectId) {
      return error(res, "dayOfWeek, period, classId, teacherId, subjectId required", 400);
    }

    const conflict = await prisma.timetableSlot.findFirst({
      where: {
        OR: [
          { classId: Number(classId), dayOfWeek: Number(dayOfWeek), period: Number(period) },
          { teacherId: Number(teacherId), dayOfWeek: Number(dayOfWeek), period: Number(period) },
        ],
      },
    });
    if (conflict) return error(res, "Timetable conflict detected", 400);

    const slot = await prisma.timetableSlot.create({
      data: {
        dayOfWeek: Number(dayOfWeek),
        period: Number(period),
        room,
        classId: Number(classId),
        teacherId: Number(teacherId),
        subjectId: Number(subjectId),
      },
      include: { class: true, teacher: true, subject: true },
    });
    return success(res, slot, "Slot created");
  } catch (err) {
    return error(res, err.message);
  }
};

export const deleteSlot = async (req, res) => {
  try {
    await prisma.timetableSlot.delete({ where: { id: Number(req.params.id) } });
    return success(res, null, "Slot deleted");
  } catch (err) {
    if (err.code === "P2025") return error(res, "Not found", 404);
    return error(res, err.message);
  }
};
