import prisma from "../../prisma/client.js";
import { success, error } from "../utils/response.js";

export const getDashboardStats = async (req, res) => {
  try {
    const { term, year } = req.query;
    const assessmentWhere = {};
    if (term) assessmentWhere.term = term;

    const [studentCount, teacherCount, classCount, assessments, attendances] = await Promise.all([
      prisma.student.count(),
      prisma.teacher.count(),
      prisma.class.count(),
      prisma.assessment.findMany({ where: assessmentWhere, select: { score: true, term: true } }),
      prisma.attendance.findMany({
        where: year ? { year: Number(year) } : {},
        select: { status: true },
      }),
    ]);

    // feePayment groupBy can fail on empty tables — run separately with fallback
    let feeOverview = [];
    try {
      feeOverview = await prisma.feePayment.groupBy({
        by: ["status"],
        _sum: { amount: true },
        _count: true,
      });
    } catch (_) {
      feeOverview = [];
    }

    const gradeDist = { EE: 0, ME: 0, AE: 0, BE: 0 };
    assessments.forEach((a) => { if (gradeDist[a.score] !== undefined) gradeDist[a.score]++; });

    const attDist = { PRESENT: 0, ABSENT: 0, LATE: 0, EXCUSED: 0 };
    attendances.forEach((a) => { if (attDist[a.status] !== undefined) attDist[a.status]++; });

    let termTrend = [];
    try {
      termTrend = await prisma.assessment.groupBy({
        by: ["term"],
        _count: true,
      });
    } catch (_) {
      termTrend = [];
    }

    // Attendance rate (present / total)
    const totalAtt = attendances.length;
    const attendanceRate = totalAtt > 0
      ? Math.round((attDist.PRESENT / totalAtt) * 100)
      : null;

    // Fee totals
    const feeTotals = { collected: 0, pending: 0 };
    feeOverview.forEach((f) => {
      if (f.status === "COMPLETED") feeTotals.collected += f._sum.amount ?? 0;
      if (f.status === "PENDING") feeTotals.pending += f._sum.amount ?? 0;
    });

    return success(res, {
      studentCount,
      teacherCount,
      classCount,
      gradeDist,
      attDist,
      attendanceRate,
      termTrend,
      feeOverview,
      feeTotals,
    }, "Analytics fetched");
  } catch (err) {
    return error(res, err.message);
  }
};

export const getClassPerformance = async (req, res) => {
  try {
    const { classId, term } = req.query;
    if (!classId) return error(res, "classId required", 400);

    const students = await prisma.student.findMany({
      where: { classId: Number(classId) },
      include: {
        assessments: term ? { where: { term } } : true,
      },
    });

    const data = students.map((s) => {
      const scores = s.assessments.map((a) => a.score);
      const counts = { EE: 0, ME: 0, AE: 0, BE: 0 };
      scores.forEach((sc) => { if (counts[sc] !== undefined) counts[sc]++; });
      return { studentId: s.id, fullName: s.fullName, admissionNo: s.admissionNo, counts, total: scores.length };
    });

    return success(res, data, "Class performance fetched");
  } catch (err) {
    return error(res, err.message);
  }
};

export const getAuditLogs = async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { user: { select: { fullName: true, email: true } } },
    });
    return success(res, logs, "Audit logs fetched");
  } catch (err) {
    return error(res, err.message);
  }
};
