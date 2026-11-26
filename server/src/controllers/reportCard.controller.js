import prisma from "../../prisma/client.js";
import { success, error as errorResponse } from "../utils/response.js";

export const generateReportCard = async (req, res) => {
  try {
    const { studentId, term, year, teacherRemark, principalRemark, strengths, nextSteps } = req.body;
    if (!studentId || !term || !year) {
      return errorResponse(res, "studentId, term, and year are required", 400);
    }

    // Prevent duplicate report cards for the same student/term/year
    const existing = await prisma.reportCard.findFirst({
      where: { studentId: Number(studentId), term: String(term), year: String(year) },
    });
    if (existing) {
      return errorResponse(
        res,
        `A report card for Term ${term} ${year} already exists for this student. Delete it first to regenerate.`,
        400
      );
    }

    const assessments = await prisma.assessment.findMany({
      where: { studentId: Number(studentId), term: String(term) },
    });
    if (assessments.length === 0) {
      return errorResponse(res, "No assessments found for this student and term", 400);
    }

    const learnerProfiles = await prisma.learnerProfile.findMany({
      where: { studentId: Number(studentId), term: String(term), year: String(year) },
    });

    const scoreMap = { EE: 4, ME: 3, AE: 2, BE: 1 };
    const avg = assessments.reduce((sum, a) => sum + (scoreMap[a.score] ?? 1), 0) / assessments.length;
    const grade = avg >= 3.5 ? "A" : avg >= 2.5 ? "B" : avg >= 1.5 ? "C" : "D";
    const remarkMap = {
      A: "Excellent performance. Keep demonstrating strong CBC competencies.",
      B: "Good performance. Continue strengthening identified learning areas.",
      C: "Satisfactory performance. Focus on consistency and mastery.",
      D: "Needs improvement. Targeted support will help the learner grow.",
    };

    const profileSummary = learnerProfiles.length
      ? learnerProfiles
          .map((p) => `${p.category.replace(/_/g, " ")}: ${p.level}`)
          .join(" • ")
      : null;

    const dispositionNote = learnerProfiles.some((p) => ["BEGINNING", "DEVELOPING"].includes(p.level))
      ? "The learner profile indicates areas where habits and dispositions need closer support."
      : learnerProfiles.length
      ? "Learner dispositions are strong across CBC profile categories."
      : "";

    const report = await prisma.reportCard.create({
      data: {
        studentId:       Number(studentId),
        term:            String(term),
        year:            String(year),
        overallGrade:    grade,
        remark:          `${remarkMap[grade]} ${dispositionNote}`.trim(),
        strengths:       strengths ?? (profileSummary ? `Strong profile traits: ${profileSummary}` : null),
        nextSteps:       nextSteps ?? "Continue to build mastery through practical tasks and learner reflection.",
        learnerProfileSummary: profileSummary,
        teacherRemark:   teacherRemark ?? null,
        principalRemark: principalRemark ?? null,
      },
      include: { student: true },
    });

    return success(res, report, "Report card generated");
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

export const getReportCards = async (req, res) => {
  try {
    const schoolId = req.user.schoolId;
    let reports;
    if (req.user.role === "STUDENT") {
      const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
      if (!student) return errorResponse(res, "Student record not found", 404);
      reports = await prisma.reportCard.findMany({
        where: { studentId: student.id },
        include: { student: true },
        orderBy: { createdAt: "desc" },
      });
    } else {
      reports = await prisma.reportCard.findMany({
        where: { student: { schoolId } },
        include: { student: true },
        orderBy: { createdAt: "desc" },
      });
    }
    return success(res, reports, "Report cards fetched");
  } catch (err) {
    return errorResponse(res, err.message);
  }
};
