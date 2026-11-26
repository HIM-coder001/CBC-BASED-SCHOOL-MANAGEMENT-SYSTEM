import prisma from "../../prisma/client.js";
import { success, error } from "../utils/response.js";
import { generateReportPDF } from "../utils/pdf/reportCard.pdf.js";
import {
  exportGradesToJSON,
  exportGradesToCSV,
  exportGradesToExcel,
  exportReportCardToPDF,
  exportCompetencyReportToExcel,
} from "../utils/export.utils.js";

// EXPORT GRADES TO JSON
export const exportGradesToJSONController = async (req, res) => {
  try {
    const { studentId, term } = req.query;

    let whereClause = {};
    if (studentId) whereClause.studentId = Number(studentId);
    if (term) whereClause.term = term;

    const grades = await prisma.assessment.findMany({
      where: whereClause,
      include: {
        student: true,
        subStrand: {
          include: {
            strand: {
              include: {
                learningArea: true,
              },
            },
          },
        },
      },
    });

    if (grades.length === 0) {
      return error(res, "No grades found", 404);
    }

    const jsonData = exportGradesToJSON(grades);

    res.setHeader("Content-Type", "application/json");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=grades.json"
    );

    return res.send(jsonData);
  } catch (err) {
    return error(res, err.message);
  }
};

// EXPORT GRADES TO CSV
export const exportGradesToCSVController = async (req, res) => {
  try {
    const { studentId, term } = req.query;

    let whereClause = {};
    if (studentId) whereClause.studentId = Number(studentId);
    if (term) whereClause.term = term;

    const grades = await prisma.assessment.findMany({
      where: whereClause,
      include: {
        student: true,
        subStrand: {
          include: {
            strand: {
              include: {
                learningArea: true,
              },
            },
          },
        },
      },
    });

    if (grades.length === 0) {
      return error(res, "No grades found", 404);
    }

    const csvData = exportGradesToCSV(grades);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=grades.csv"
    );

    return res.send(csvData);
  } catch (err) {
    return error(res, err.message);
  }
};

// EXPORT GRADES TO EXCEL
export const exportGradesToExcelController = async (req, res) => {
  try {
    const { studentId, term } = req.query;

    let whereClause = {};
    if (studentId) whereClause.studentId = Number(studentId);
    if (term) whereClause.term = term;

    const grades = await prisma.assessment.findMany({
      where: whereClause,
      include: {
        student: true,
        subStrand: {
          include: {
            strand: {
              include: {
                learningArea: true,
              },
            },
          },
        },
      },
    });

    if (grades.length === 0) {
      return error(res, "No grades found", 404);
    }

    const excelBuffer = await exportGradesToExcel(grades);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=grades.xlsx"
    );

    return res.send(excelBuffer);
  } catch (err) {
    return error(res, err.message);
  }
};

// EXPORT REPORT CARD TO PDF
export const exportReportCardToPDFController = async (req, res) => {
  try {
    const { reportCardId } = req.params;

    const reportCard = await prisma.reportCard.findUnique({
      where: { id: Number(reportCardId) },
      include: {
        student: { include: { class: true } },
      },
    });
    if (!reportCard) {
      return error(res, "Report card not found", 404);
    }

    // Fetch all assessments for this student + term, grouped by learning area
    const assessments = await prisma.assessment.findMany({
      where: {
        studentId: reportCard.studentId,
        term: reportCard.term,
      },
      include: {
        subStrand: {
          include: {
            strand: {
              include: { learningArea: true },
            },
          },
        },
      },
    });

    // Group by learning area — pick the most frequent score per area
    const areaMap = {};
    assessments.forEach(a => {
      const la = a.subStrand?.strand?.learningArea;
      if (!la) return;
      if (!areaMap[la.id]) {
        areaMap[la.id] = { name: la.name, scores: [] };
      }
      areaMap[la.id].scores.push(a.score);
    });

    const scoreRank = { EE: 4, ME: 3, AE: 2, BE: 1 };
    const gradeFromAvg = (avg) => avg >= 3.5 ? "A" : avg >= 2.5 ? "B" : avg >= 1.5 ? "C" : "D";

    const learningAreas = Object.values(areaMap).map(area => {
      // Dominant score = highest average
      const avg = area.scores.reduce((s, sc) => s + (scoreRank[sc] ?? 1), 0) / area.scores.length;
      // Most frequent score
      const freq = {};
      area.scores.forEach(sc => { freq[sc] = (freq[sc] ?? 0) + 1; });
      const dominant = Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "ME";
      return {
        name: area.name,
        score: dominant,
        grade: gradeFromAvg(avg),
      };
    });

    // Compute average across all assessments
    const totalAvg = assessments.length > 0
      ? assessments.reduce((s, a) => s + (scoreRank[a.score] ?? 1), 0) / assessments.length
      : 0;

    const pdfData = {
      student:         reportCard.student,
      term:            reportCard.term,
      year:            reportCard.year,
      overallGrade:    reportCard.overallGrade,
      remark:          reportCard.remark,
      strengths:       reportCard.strengths,
      nextSteps:       reportCard.nextSteps,
      learnerProfileSummary: reportCard.learnerProfileSummary,
      teacherRemark:   reportCard.teacherRemark,
      principalRemark: reportCard.principalRemark,
      average:         totalAvg,
      learningAreas,
      // School settings for header
      schoolSettings: await prisma.schoolSettings.findFirst() ?? { schoolName: "SchoolHub CBC Academy" },
      // Attendance for this student
      attendance: await (async () => {
        const att = await prisma.attendance.findMany({
          where: { studentId: reportCard.studentId, term: reportCard.term },
        });
        return {
          total:   att.length,
          present: att.filter(a => a.status === "PRESENT").length,
          absent:  att.filter(a => a.status === "ABSENT").length,
          late:    att.filter(a => a.status === "LATE").length,
        };
      })(),
      // Core competencies for this student
      competencies: await (async () => {
        const comps = await prisma.competency.findMany({
          where: { studentId: reportCard.studentId },
          select: { name: true },
        });
        return [...new Set(comps.map(c => c.name))];
      })(),
      // Class teacher name
      classTeacher: reportCard.student?.class
        ? await (async () => {
            const teacher = await prisma.teacher.findFirst({
              where: { classId: reportCard.student.class.id },
            });
            return teacher?.fullName ?? null;
          })()
        : null,
    };

    generateReportPDF(pdfData, res);
  } catch (err) {
    return error(res, err.message);
  }
};

// EXPORT COMPETENCY REPORT TO EXCEL
export const exportCompetencyReportController = async (req, res) => {
  try {
    const { studentId, grade } = req.query;

    let whereClause = {};
    if (studentId) whereClause.studentId = Number(studentId);
    if (grade) whereClause.grade = grade;

    const competencies = await prisma.competency.findMany({
      where: whereClause,
      include: {
        student: true,
        learningArea: true,
        skillAssessments: true,
      },
    });

    if (competencies.length === 0) {
      return error(res, "No competencies found", 404);
    }

    const excelBuffer = await exportCompetencyReportToExcel(competencies);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=competency-report.xlsx"
    );

    return res.send(excelBuffer);
  } catch (err) {
    return error(res, err.message);
  }
};

// EXPORT ALL REPORT CARDS TO EXCEL
export const exportAllReportCardsController = async (req, res) => {
  try {
    const { term, year } = req.query;

    let whereClause = {};
    if (term) whereClause.term = term;
    if (year) whereClause.year = year;

    const reportCards = await prisma.reportCard.findMany({
      where: whereClause,
      include: {
        student: true,
      },
    });

    if (reportCards.length === 0) {
      return error(res, "No report cards found", 404);
    }

    const workbook = new (await import("exceljs")).Workbook();
    const worksheet = workbook.addWorksheet("Report Cards");

    // Add headers
    worksheet.columns = [
      { header: "Student Name", key: "studentName", width: 20 },
      { header: "Admission No", key: "admissionNo", width: 15 },
      { header: "Overall Grade", key: "overallGrade", width: 15 },
      { header: "Term", key: "term", width: 10 },
      { header: "Year", key: "year", width: 10 },
      { header: "Remark", key: "remark", width: 30 },
      { header: "Date Generated", key: "dateGenerated", width: 15 },
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF366092" },
    };

    // Add data
    reportCards.forEach((rc) => {
      worksheet.addRow({
        studentName: rc.student?.fullName || "",
        admissionNo: rc.student?.admissionNo || "",
        overallGrade: rc.overallGrade || "",
        term: rc.term || "",
        year: rc.year || "",
        remark: rc.remark || "",
        dateGenerated: new Date(rc.createdAt).toLocaleDateString() || "",
      });
    });

    const excelBuffer = await workbook.xlsx.writeBuffer();

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=report-cards.xlsx"
    );

    return res.send(excelBuffer);
  } catch (err) {
    return error(res, err.message);
  }
};
