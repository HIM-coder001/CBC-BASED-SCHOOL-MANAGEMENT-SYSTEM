import prisma from "../../prisma/client.js";
import { success, error } from "../utils/response.js";

export const getDisciplineRecords = async (req, res) => {
  try {
    const { studentId } = req.query;
    const where = studentId ? { studentId: Number(studentId) } : {};
    const records = await prisma.disciplineRecord.findMany({
      where,
      include: { student: true },
      orderBy: { date: "desc" },
    });
    return success(res, records, "Discipline records fetched");
  } catch (err) {
    return error(res, err.message);
  }
};

export const createDisciplineRecord = async (req, res) => {
  try {
    const { studentId, incident, action, severity, date } = req.body;
    if (!studentId || !incident) return error(res, "studentId and incident required", 400);
    const record = await prisma.disciplineRecord.create({
      data: {
        studentId: Number(studentId),
        incident,
        action,
        severity: severity ?? "MINOR",
        date: date ? new Date(date) : new Date(),
        recordedById: req.user.id,
      },
      include: { student: true },
    });
    return success(res, record, "Record created");
  } catch (err) {
    return error(res, err.message);
  }
};

export const getEvents = async (req, res) => {
  try {
    const events = await prisma.schoolEvent.findMany({ orderBy: { startDate: "asc" } });
    return success(res, events, "Events fetched");
  } catch (err) {
    return error(res, err.message);
  }
};

export const createEvent = async (req, res) => {
  try {
    const { title, description, startDate, endDate, location } = req.body;
    if (!title || !startDate) return error(res, "title and startDate required", 400);
    const event = await prisma.schoolEvent.create({
      data: {
        title,
        description,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        location,
      },
    });
    return success(res, event, "Event created");
  } catch (err) {
    return error(res, err.message);
  }
};

export const deleteDisciplineRecord = async (req, res) => {
  try {
    await prisma.disciplineRecord.delete({ where: { id: Number(req.params.id) } });
    return success(res, null, "Deleted");
  } catch (err) {
    if (err.code === "P2025") return error(res, "Not found", 404);
    return error(res, err.message);
  }
};
