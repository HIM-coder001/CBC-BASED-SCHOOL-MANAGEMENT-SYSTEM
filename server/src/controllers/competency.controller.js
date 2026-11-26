import prisma from "../../prisma/client.js";
import { success, error } from "../utils/response.js";

// CREATE COMPETENCY
export const createCompetency = async (req, res) => {
  try {
    const { code, name, description, grade, learningAreaId, studentId, level, evidence } = req.body;

    const competency = await prisma.competency.create({
      data: {
        code,
        name,
        description,
        grade,
        learningAreaId: Number(learningAreaId),
        studentId: Number(studentId),
        level,
        evidence,
      },
      include: {
        learningArea: true,
        student: true,
        skillAssessments: true,
      },
    });

    return success(res, competency, "Competency created successfully");
  } catch (err) {
    if (err.code === "P2002") {
      return error(res, "Competency already exists for this student", 400);
    }
    return error(res, err.message);
  }
};

// GET STUDENT COMPETENCIES
export const getStudentCompetencies = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { grade, learningAreaId } = req.query;

    // Confirm student belongs to the same school
    const student = await prisma.student.findUnique({ where: { id: Number(studentId) } });
    if (!student || student.schoolId !== req.user.schoolId) {
      return error(res, "Student not found", 404);
    }

    let whereClause = { studentId: Number(studentId) };

    if (grade) whereClause.grade = grade;
    if (learningAreaId) whereClause.learningAreaId = Number(learningAreaId);

    const competencies = await prisma.competency.findMany({
      where: whereClause,
      include: {
        learningArea: true,
        skillAssessments: {
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { code: "asc" },
    });

    const summary = {
      total: competencies.length,
      developing: competencies.filter((c) => c.level === "DEVELOPING").length,
      proficient: competencies.filter((c) => c.level === "PROFICIENT").length,
      advanced: competencies.filter((c) => c.level === "ADVANCED").length,
      mastered: competencies.filter((c) => c.level === "MASTERED").length,
      competencies,
    };

    return success(res, summary, "Student competencies retrieved successfully");
  } catch (err) {
    return error(res, err.message);
  }
};

// UPDATE COMPETENCY
export const updateCompetency = async (req, res) => {
  try {
    const { id } = req.params;
    const { level, evidence, name, description } = req.body;

    const updated = await prisma.competency.update({
      where: { id: Number(id) },
      data: {
        ...(level && { level }),
        ...(evidence && { evidence }),
        ...(name && { name }),
        ...(description && { description }),
      },
      include: {
        learningArea: true,
        student: true,
        skillAssessments: true,
      },
    });

    return success(res, updated, "Competency updated successfully");
  } catch (err) {
    return error(res, err.message);
  }
};

// DELETE COMPETENCY
export const deleteCompetency = async (req, res) => {
  try {
    const { id } = req.params;

    // Delete related skill assessments first
    await prisma.skillAssessment.deleteMany({
      where: { competencyId: Number(id) },
    });

    await prisma.competency.delete({
      where: { id: Number(id) },
    });

    return success(res, null, "Competency deleted successfully");
  } catch (err) {
    return error(res, err.message);
  }
};

// GET COMPETENCY REPORT
export const getCompetencyReport = async (req, res) => {
  try {
    const { studentId, grade } = req.query;
    const schoolId = req.user.schoolId;

    // Always scope via student's school
    let whereClause = { student: { schoolId } };

    if (studentId) whereClause.studentId = Number(studentId);
    if (grade)     whereClause.grade     = grade;

    const competencies = await prisma.competency.findMany({
      where: whereClause,
      include: {
        learningArea: true,
        student: true,
        skillAssessments: {
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: [{ student: { fullName: "asc" } }, { code: "asc" }],
    });

    const report = {};
    competencies.forEach((comp) => {
      if (!report[comp.studentId]) {
        report[comp.studentId] = {
          studentId: comp.studentId,
          studentName: comp.student.fullName,
          grade: comp.grade,
          competencies: [],
        };
      }

      report[comp.studentId].competencies.push({
        id: comp.id,
        code: comp.code,
        name: comp.name,
        level: comp.level,
        evidence: comp.evidence,
        skillCount: comp.skillAssessments.length,
        skills: comp.skillAssessments,
      });
    });

    return success(res, Object.values(report), "Competency report generated successfully");
  } catch (err) {
    return error(res, err.message);
  }
};
