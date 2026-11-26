import prisma from "../../prisma/client.js";
import { success, error } from "../utils/response.js";

const VALID_SCORES = ["EE", "ME", "AE", "BE"];
const VALID_TYPES = ["FORMATIVE", "SUMMATIVE", "PRACTICAL", "PROJECT"];

export const createAssessment = async (req, res) => {
  try {
    const { studentId, subStrandId, score, term, assessmentType } = req.body;
    if (!studentId || !subStrandId || !score || !term) {
      return error(res, "studentId, subStrandId, score, and term are required", 400);
    }
    if (!VALID_SCORES.includes(score)) {
      return error(res, "Invalid score value. Must be one of: EE, ME, AE, BE", 400);
    }
    if (assessmentType && !VALID_TYPES.includes(assessmentType)) {
      return error(res, `Invalid assessmentType. Must be one of: ${VALID_TYPES.join(", ")}` , 400);
    }
    const assessment = await prisma.assessment.create({
      data: {
        studentId: Number(studentId),
        subStrandId: Number(subStrandId),
        score,
        term,
        assessmentType: assessmentType || undefined,
      },
      include: { student: true, subStrand: { include: { strand: { include: { learningArea: true } } } } },
    });
    return success(res, assessment, "Assessment created successfully");
  } catch (err) {
    if (err.code === "P2002") return error(res, "Assessment already exists for this student and sub-strand", 400);
    return error(res, err.message);
  }
};

export const getAssessments = async (req, res) => {
  try {
    const { term, year, classId, studentId, page = 1, limit = 100 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const schoolId = req.user.schoolId;

    // Always scope via the student's school
    const where = { student: { schoolId } };
    if (term)      where.term      = term;
    if (studentId) where.studentId = Number(studentId);
    if (classId)   where.student   = { ...where.student, classId: Number(classId) };
    const [assessments, total] = await Promise.all([
      prisma.assessment.findMany({
        where,
        include: { student: true, subStrand: { include: { strand: { include: { learningArea: true } } } } },
        skip, take: Number(limit),
        orderBy: { createdAt: "desc" },
      }),
      prisma.assessment.count({ where }),
    ]);
    return success(res, { assessments, total }, "Assessments fetched successfully");
  } catch (err) {
    return error(res, err.message);
  }
};

export const updateAssessment = async (req, res) => {
  try {
    const { id } = req.params;
    const { score, assessmentType } = req.body;
    if (score && !VALID_SCORES.includes(score)) {
      return error(res, "Invalid score value. Must be one of: EE, ME, AE, BE", 400);
    }
    if (assessmentType && !VALID_TYPES.includes(assessmentType)) {
      return error(res, `Invalid assessmentType. Must be one of: ${VALID_TYPES.join(", ")}` , 400);
    }
    const assessment = await prisma.assessment.update({
      where: { id: Number(id) },
      data: req.body,
      include: { student: true, subStrand: { include: { strand: { include: { learningArea: true } } } } },
    });
    return success(res, assessment, "Assessment updated successfully");
  } catch (err) {
    if (err.code === "P2025") return error(res, "Record not found", 404);
    return error(res, err.message);
  }
};

export const deleteAssessment = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.assessment.delete({ where: { id: Number(id) } });
    return success(res, null, "Assessment deleted successfully");
  } catch (err) {
    if (err.code === "P2025") return error(res, "Record not found", 404);
    return error(res, err.message);
  }
};

// BULK CREATE — one sub-strand, one term, many students
export const bulkCreateAssessments = async (req, res) => {
  try {
    const { subStrandId, term, assessmentType, entries } = req.body;
    // entries: [{ studentId, score }]

    if (!subStrandId || !term || !Array.isArray(entries) || entries.length === 0) {
      return error(res, "subStrandId, term, and entries[] are required", 400);
    }
    if (assessmentType && !VALID_TYPES.includes(assessmentType)) {
      return error(res, `Invalid assessmentType. Must be one of: ${VALID_TYPES.join(", ")}` , 400);
    }

    const invalid = entries.find(e => !VALID_SCORES.includes(e.score));
    if (invalid) {
      return error(res, `Invalid score "${invalid.score}". Must be one of: EE, ME, AE, BE`, 400);
    }

    // Use createMany with skipDuplicates — existing records are left untouched
    const data = entries.map(e => ({
      studentId: Number(e.studentId),
      subStrandId: Number(subStrandId),
      score: e.score,
      term: String(term),
      assessmentType: assessmentType || undefined,
    }));

    const result = await prisma.assessment.createMany({ data, skipDuplicates: true });

    return success(res, { created: result.count, total: entries.length }, "Bulk assessments saved successfully");
  } catch (err) {
    return error(res, err.message);
  }
};
