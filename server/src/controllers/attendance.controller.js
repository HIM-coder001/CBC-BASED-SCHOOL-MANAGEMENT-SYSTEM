import prisma from "../../prisma/client.js";
import { success, error } from "../utils/response.js";
import { notifyAbsence } from "../utils/notify.js";
import { logAudit } from "../utils/audit.js";

// CREATE ATTENDANCE
export const createAttendance = async (req, res) => {
  try {
    const { studentId, date, status, remarks, term, year } = req.body;

    // Confirm student belongs to the same school
    const student = await prisma.student.findUnique({ where: { id: Number(studentId) } });
    if (!student || student.schoolId !== req.user.schoolId) {
      return error(res, "Student not found", 404);
    }

    const attendance = await prisma.attendance.create({
      data: {
        studentId: Number(studentId),
        date: new Date(date),
        status,
        remarks,
        term,
        year: Number(year),
      },
      include: {
        student: true,
      },
    });

    if (["ABSENT", "LATE"].includes(status)) {
      notifyAbsence(studentId, date, status).catch(() => {});
    }

    await logAudit({
      userId: req.user.id,
      action: "CREATE",
      entity: "Attendance",
      entityId: attendance.id,
      after: { studentId, status, date },
    });

    return success(res, attendance, "Attendance recorded successfully");
  } catch (err) {
    if (err.code === "P2002") {
      return error(res, "Attendance already recorded for this date", 400);
    }
    return error(res, err.message);
  }
};

// GET ATTENDANCE FOR STUDENT
export const getStudentAttendance = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { term, year } = req.query;

    // Confirm student belongs to the same school
    const student = await prisma.student.findUnique({ where: { id: Number(studentId) } });
    if (!student || student.schoolId !== req.user.schoolId) {
      return error(res, "Student not found", 404);
    }

    let whereClause = { studentId: Number(studentId) };

    if (term) whereClause.term = term;
    if (year) whereClause.year = Number(year);

    const attendance = await prisma.attendance.findMany({
      where: whereClause,
      include: {
        student: true,
      },
      orderBy: { date: "desc" },
    });

    const summary = {
      total: attendance.length,
      present: attendance.filter((a) => a.status === "PRESENT").length,
      absent: attendance.filter((a) => a.status === "ABSENT").length,
      late: attendance.filter((a) => a.status === "LATE").length,
      excused: attendance.filter((a) => a.status === "EXCUSED").length,
      records: attendance,
    };

    return success(res, summary, "Attendance retrieved successfully");
  } catch (err) {
    return error(res, err.message);
  }
};

// GET CLASS ATTENDANCE
export const getClassAttendance = async (req, res) => {
  try {
    const { classId } = req.params;
    const { date, term } = req.query;

    // Confirm class belongs to the same school
    const cls = await prisma.class.findUnique({ where: { id: Number(classId) } });
    if (!cls || cls.schoolId !== req.user.schoolId) {
      return error(res, "Class not found", 404);
    }

    let whereClause = { student: { classId: Number(classId) } };

    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      whereClause.date = { gte: startDate, lt: endDate };
    }

    if (term) whereClause.term = term;

    const attendance = await prisma.attendance.findMany({
      where: whereClause,
      include: {
        student: true,
      },
      orderBy: { date: "desc" },
    });

    return success(res, attendance, "Class attendance retrieved successfully");
  } catch (err) {
    return error(res, err.message);
  }
};

// UPDATE ATTENDANCE
export const updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    const updated = await prisma.attendance.update({
      where: { id: Number(id) },
      data: {
        ...(status && { status }),
        ...(remarks !== undefined && { remarks }),
      },
      include: {
        student: true,
      },
    });

    return success(res, updated, "Attendance updated successfully");
  } catch (err) {
    return error(res, err.message);
  }
};

// DELETE ATTENDANCE
export const deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.attendance.delete({
      where: { id: Number(id) },
    });

    return success(res, null, "Attendance deleted successfully");
  } catch (err) {
    return error(res, err.message);
  }
};

// GET ATTENDANCE REPORT
export const getAttendanceReport = async (req, res) => {
  try {
    const { term, year, classId } = req.query;
    const schoolId = req.user.schoolId;

    let whereClause = { student: { schoolId } };

    if (classId) {
      whereClause.student = { ...whereClause.student, classId: Number(classId) };
    }

    if (term) whereClause.term = term;
    if (year) whereClause.year = Number(year);

    const attendances = await prisma.attendance.findMany({
      where: whereClause,
      include: { student: true },
      orderBy: [{ student: { fullName: "asc" } }, { date: "asc" }],
    });

    const report = {};
    attendances.forEach((att) => {
      if (!report[att.student.id]) {
        report[att.student.id] = {
          studentId: att.student.id,
          studentName: att.student.fullName,
          admissionNo: att.student.admissionNo,
          present: 0,
          absent: 0,
          late: 0,
          excused: 0,
          total: 0,
        };
      }

      report[att.student.id][att.status.toLowerCase()]++;
      report[att.student.id].total++;
    });

    const reportArray = Object.values(report).map(r => ({
      ...r,
      percentage: r.total > 0 ? ((r.present / r.total) * 100).toFixed(1) : "0.0",
    }));

    return success(res, reportArray, "Attendance report generated successfully");
  } catch (err) {
    return error(res, err.message);
  }
};
