import prisma from "../../prisma/client.js";
import { success, error } from "../utils/response.js";

const VALID_CATEGORIES = [
  "COMMUNICATION",
  "CRITICAL_THINKING",
  "CREATIVITY",
  "CITIZENSHIP",
  "DIGITAL_LITERACY",
  "SELF_MANAGEMENT",
];

const VALID_LEVELS = ["BEGINNING", "DEVELOPING", "PROFICIENT", "ADVANCED", "MASTERED"];

export const createLearnerProfile = async (req, res) => {
  try {
    const { studentId, term, year, category, level, comments } = req.body;
    if (!studentId || !term || !year || !category || !level) {
      return error(res, "studentId, term, year, category, and level are required", 400);
    }
    if (!VALID_CATEGORIES.includes(category)) {
      return error(res, `Invalid category. Valid values are: ${VALID_CATEGORIES.join(", ")}` , 400);
    }
    if (!VALID_LEVELS.includes(level)) {
      return error(res, `Invalid level. Valid values are: ${VALID_LEVELS.join(", ")}` , 400);
    }

    const profile = await prisma.learnerProfile.create({
      data: {
        studentId: Number(studentId),
        term: String(term),
        year: String(year),
        category,
        level,
        comments,
      },
      include: { student: true },
    });

    return success(res, profile, "Learner profile saved successfully");
  } catch (err) {
    if (err.code === "P2002") {
      return error(res, "Learner profile for this category already exists for the selected term and year", 400);
    }
    return error(res, err.message);
  }
};

export const getLearnerProfiles = async (req, res) => {
  try {
    const { studentId, term, year } = req.query;
    const schoolId = req.user.schoolId;
    const where = { student: { schoolId } };

    if (studentId) where.studentId = Number(studentId);
    if (term) where.term = String(term);
    if (year) where.year = String(year);

    if (req.user.role === "STUDENT") {
      const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
      if (!student) return error(res, "Student record not found", 404);
      where.studentId = student.id;
    }

    const profiles = await prisma.learnerProfile.findMany({
      where,
      include: { student: true },
      orderBy: [{ year: "desc" }, { term: "asc" }, { category: "asc" }],
    });

    return success(res, { profiles }, "Learner profiles fetched successfully");
  } catch (err) {
    return error(res, err.message);
  }
};

export const updateLearnerProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { term, year, category, level, comments } = req.body;

    if (category && !VALID_CATEGORIES.includes(category)) {
      return error(res, `Invalid category. Valid values are: ${VALID_CATEGORIES.join(", ")}` , 400);
    }
    if (level && !VALID_LEVELS.includes(level)) {
      return error(res, `Invalid level. Valid values are: ${VALID_LEVELS.join(", ")}` , 400);
    }

    const updated = await prisma.learnerProfile.update({
      where: { id: Number(id) },
      data: {
        ...(term && { term: String(term) }),
        ...(year && { year: String(year) }),
        ...(category && { category }),
        ...(level && { level }),
        ...(comments !== undefined && { comments }),
      },
      include: { student: true },
    });

    return success(res, updated, "Learner profile updated successfully");
  } catch (err) {
    if (err.code === "P2025") return error(res, "Learner profile not found", 404);
    return error(res, err.message);
  }
};

export const deleteLearnerProfile = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.learnerProfile.delete({ where: { id: Number(id) } });
    return success(res, null, "Learner profile deleted successfully");
  } catch (err) {
    if (err.code === "P2025") return error(res, "Learner profile not found", 404);
    return error(res, err.message);
  }
};
