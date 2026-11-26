import prisma from "../../prisma/client.js";
import { success, error } from "../utils/response.js";

export const getSubmissions = async (req, res) => {
  try {
    const { teacherId, term, year } = req.query;
    const where = {};
    if (teacherId) where.teacherId = Number(teacherId);
    if (term) where.term = term;
    if (year) where.year = Number(year);

    if (req.user.role === "TEACHER") {
      const teacher = await prisma.teacher.findUnique({ where: { userId: req.user.id } });
      if (teacher) where.teacherId = teacher.id;
    }

    const subs = await prisma.tpadSubmission.findMany({
      where,
      include: { teacher: true },
      orderBy: { updatedAt: "desc" },
    });
    return success(res, subs, "TPAD submissions fetched");
  } catch (err) {
    return error(res, err.message);
  }
};

export const upsertSubmission = async (req, res) => {
  try {
    const { teacherId, term, year, data, status } = req.body;
    let tid = teacherId ? Number(teacherId) : null;
    if (req.user.role === "TEACHER") {
      const teacher = await prisma.teacher.findUnique({ where: { userId: req.user.id } });
      if (!teacher) return error(res, "Teacher profile not found", 404);
      tid = teacher.id;
    }
    if (!tid || !term || !year) return error(res, "teacherId, term, year required", 400);

    const sub = await prisma.tpadSubmission.upsert({
      where: { teacherId_term_year: { teacherId: tid, term, year: Number(year) } },
      update: { data: data ?? {}, status: status ?? "DRAFT" },
      create: { teacherId: tid, term, year: Number(year), data: data ?? {}, status: status ?? "DRAFT" },
      include: { teacher: true },
    });
    return success(res, sub, "TPAD submission saved");
  } catch (err) {
    return error(res, err.message);
  }
};

export const reviewSubmission = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["APPROVED", "REJECTED", "SUBMITTED"].includes(status)) {
      return error(res, "Invalid status", 400);
    }
    const sub = await prisma.tpadSubmission.update({
      where: { id: Number(req.params.id) },
      data: { status, reviewedBy: req.user.id },
      include: { teacher: true },
    });
    return success(res, sub, "TPAD reviewed");
  } catch (err) {
    if (err.code === "P2025") return error(res, "Not found", 404);
    return error(res, err.message);
  }
};
