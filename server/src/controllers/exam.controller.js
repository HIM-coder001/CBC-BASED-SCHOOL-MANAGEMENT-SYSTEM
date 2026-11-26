import prisma from "../../prisma/client.js";
import { success, error } from "../utils/response.js";

const gradeFromScore = (score) => {
  if (score >= 80) return { grade: "A", points: 12 };
  if (score >= 75) return { grade: "A-", points: 11 };
  if (score >= 70) return { grade: "B+", points: 10 };
  if (score >= 65) return { grade: "B", points: 9 };
  if (score >= 60) return { grade: "B-", points: 8 };
  if (score >= 55) return { grade: "C+", points: 7 };
  if (score >= 50) return { grade: "C", points: 6 };
  if (score >= 45) return { grade: "C-", points: 5 };
  if (score >= 40) return { grade: "D+", points: 4 };
  if (score >= 35) return { grade: "D", points: 3 };
  if (score >= 30) return { grade: "D-", points: 2 };
  return { grade: "E", points: 1 };
};

export const getSessions = async (req, res) => {
  try {
    const sessions = await prisma.examSession.findMany({
      include: { subjects: true, _count: { select: { results: true } } },
      orderBy: { createdAt: "desc" },
    });
    return success(res, sessions, "Exam sessions fetched");
  } catch (err) {
    return error(res, err.message);
  }
};

export const createSession = async (req, res) => {
  try {
    const { name, type, year, term, subjects } = req.body;
    if (!name || !year) return error(res, "name and year required", 400);
    const session = await prisma.examSession.create({
      data: {
        name,
        type: type ?? "MOCK",
        year: Number(year),
        term,
        subjects: subjects?.length
          ? { create: subjects.map((s) => ({ name: s })) }
          : undefined,
      },
      include: { subjects: true },
    });
    return success(res, session, "Exam session created");
  } catch (err) {
    return error(res, err.message);
  }
};

export const recordResult = async (req, res) => {
  try {
    const { studentId, examSubjectId, examSessionId, score } = req.body;
    if (!studentId || !examSubjectId || !examSessionId || score == null) {
      return error(res, "studentId, examSubjectId, examSessionId, score required", 400);
    }
    const { grade, points } = gradeFromScore(Number(score));
    const result = await prisma.examResult.upsert({
      where: {
        studentId_examSubjectId_examSessionId: {
          studentId: Number(studentId),
          examSubjectId: Number(examSubjectId),
          examSessionId: Number(examSessionId),
        },
      },
      update: { score: Number(score), grade, points },
      create: {
        studentId: Number(studentId),
        examSubjectId: Number(examSubjectId),
        examSessionId: Number(examSessionId),
        score: Number(score),
        grade,
        points,
      },
      include: { student: true, examSubject: true },
    });
    return success(res, result, "Result recorded");
  } catch (err) {
    return error(res, err.message);
  }
};

export const getSessionAnalysis = async (req, res) => {
  try {
    const sessionId = Number(req.params.id);
    const results = await prisma.examResult.findMany({
      where: { examSessionId: sessionId },
      include: { student: { include: { class: true } }, examSubject: true },
    });

    const byStudent = {};
    results.forEach((r) => {
      if (!byStudent[r.studentId]) {
        byStudent[r.studentId] = {
          student: r.student,
          subjects: [],
          totalPoints: 0,
          meanScore: 0,
        };
      }
      byStudent[r.studentId].subjects.push(r);
      byStudent[r.studentId].totalPoints += r.points ?? 0;
    });

    Object.values(byStudent).forEach((s) => {
      s.meanScore = s.subjects.reduce((a, b) => a + b.score, 0) / s.subjects.length;
    });

    return success(res, Object.values(byStudent), "Analysis fetched");
  } catch (err) {
    return error(res, err.message);
  }
};
