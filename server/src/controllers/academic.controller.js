import prisma from "../../prisma/client.js";
import { success, error } from "../utils/response.js";

export const getAcademicYears = async (req, res) => {
  try {
    const years = await prisma.academicYear.findMany({
      include: { terms: true },
      orderBy: { year: "desc" },
    });
    return success(res, years, "Academic years fetched");
  } catch (err) {
    return error(res, err.message);
  }
};

export const createAcademicYear = async (req, res) => {
  try {
    const { year, isCurrent } = req.body;
    if (!year) return error(res, "year required", 400);
    if (isCurrent) {
      await prisma.academicYear.updateMany({ data: { isCurrent: false } });
    }
    const ay = await prisma.academicYear.create({
      data: { year: Number(year), isCurrent: !!isCurrent },
    });
    return success(res, ay, "Academic year created");
  } catch (err) {
    if (err.code === "P2002") return error(res, "Year already exists", 400);
    return error(res, err.message);
  }
};

export const createTerm = async (req, res) => {
  try {
    const { name, startDate, endDate, academicYearId, isLocked } = req.body;
    if (!name || !startDate || !endDate || !academicYearId) {
      return error(res, "name, startDate, endDate, academicYearId required", 400);
    }
    const term = await prisma.term.create({
      data: {
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        academicYearId: Number(academicYearId),
        isLocked: !!isLocked,
      },
    });
    return success(res, term, "Term created");
  } catch (err) {
    return error(res, err.message);
  }
};

export const lockTerm = async (req, res) => {
  try {
    const term = await prisma.term.update({
      where: { id: Number(req.params.id) },
      data: { isLocked: true },
    });
    return success(res, term, "Term locked");
  } catch (err) {
    if (err.code === "P2025") return error(res, "Not found", 404);
    return error(res, err.message);
  }
};

export const checkTermLocked = async (termName) => {
  const term = await prisma.term.findFirst({ where: { name: termName, isLocked: true } });
  return !!term;
};
