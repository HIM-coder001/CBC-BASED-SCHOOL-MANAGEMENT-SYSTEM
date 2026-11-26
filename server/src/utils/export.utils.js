import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";

// Export grades to JSON
export const exportGradesToJSON = (grades) => {
  return JSON.stringify(grades, null, 2);
};

// Export grades to CSV
export const exportGradesToCSV = (grades) => {
  if (!grades || grades.length === 0) {
    return "No grades to export";
  }

  const headers = [
    "Student Name",
    "Admission No",
    "Learning Area",
    "Strand",
    "SubStrand",
    "Score",
    "Term",
    "Date",
  ];

  let csv = headers.join(",") + "\n";

  grades.forEach((grade) => {
    const row = [
      grade.student?.fullName || "",
      grade.student?.admissionNo || "",
      grade.subStrand?.strand?.learningArea?.name || "",
      grade.subStrand?.strand?.name || "",
      grade.subStrand?.name || "",
      grade.score || "",
      grade.term || "",
      new Date(grade.createdAt).toLocaleDateString() || "",
    ];

    csv += row.map((cell) => `"${cell}"`).join(",") + "\n";
  });

  return csv;
};

// Export grades to Excel
export const exportGradesToExcel = async (grades) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Grades");

  // Add headers
  worksheet.columns = [
    { header: "Student Name", key: "studentName", width: 20 },
    { header: "Admission No", key: "admissionNo", width: 15 },
    { header: "Learning Area", key: "learningArea", width: 20 },
    { header: "Strand", key: "strand", width: 20 },
    { header: "SubStrand", key: "subStrand", width: 20 },
    { header: "Score", key: "score", width: 10 },
    { header: "Term", key: "term", width: 10 },
    { header: "Date", key: "date", width: 15 },
  ];

  // Style header row
  worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  worksheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF366092" },
  };

  // Add data
  grades.forEach((grade) => {
    worksheet.addRow({
      studentName: grade.student?.fullName || "",
      admissionNo: grade.student?.admissionNo || "",
      learningArea: grade.subStrand?.strand?.learningArea?.name || "",
      strand: grade.subStrand?.strand?.name || "",
      subStrand: grade.subStrand?.name || "",
      score: grade.score || "",
      term: grade.term || "",
      date: new Date(grade.createdAt).toLocaleDateString() || "",
    });
  });

  // Auto-fit columns
  worksheet.columns.forEach((column) => {
    column.width = Math.max(column.header.length, 15);
  });

  return await workbook.xlsx.writeBuffer();
};

// Export report card to PDF
export const exportReportCardToPDF = (reportCard, student) => {
  return new Promise((resolve) => {
    const doc = new PDFDocument({ margin: 40, size: "A4" });
    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => {
      const pdf = Buffer.concat(chunks);
      resolve(pdf);
    });

    // Header
    doc
      .fontSize(16)
      .font("Helvetica-Bold")
      .text("ELDORET UNION JUNIOR SCHOOL", { align: "center" });

    doc
      .fontSize(10)
      .font("Helvetica")
      .text("P.O BOX 469 - 30100, ELDORET", { align: "center" });

    doc.moveDown(1);

    // Student Info
    doc.fontSize(11).text(`Student Name: ${student?.fullName || "N/A"}`);
    doc.text(`Admission No: ${student?.admissionNo || "N/A"}`);
    doc.text(`Term: ${reportCard?.term || "N/A"}`);
    doc.text(`Year: ${reportCard?.year || "N/A"}`);

    doc.moveDown(1);

    // Report Details
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("OVERALL GRADE", { underline: true });

    doc.fontSize(11).font("Helvetica");
    doc.text(`Grade: ${reportCard?.overallGrade || "N/A"}`);
    doc.text(`Remark: ${reportCard?.remark || "N/A"}`);

    doc.moveDown(1);

    doc.text(`Generated: ${new Date().toLocaleDateString()}`);

    doc.end();
  });
};

// Export competency report to Excel
export const exportCompetencyReportToExcel = async (competencies) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Competencies");

  // Add headers
  worksheet.columns = [
    { header: "Student Name", key: "studentName", width: 20 },
    { header: "Competency Code", key: "code", width: 15 },
    { header: "Competency Name", key: "name", width: 25 },
    { header: "Level", key: "level", width: 15 },
    { header: "Learning Area", key: "learningArea", width: 20 },
    { header: "Grade", key: "grade", width: 10 },
    { header: "Evidence", key: "evidence", width: 30 },
  ];

  // Style header row
  worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  worksheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF366092" },
  };

  // Add data
  competencies.forEach((comp) => {
    worksheet.addRow({
      studentName: comp.student?.fullName || "",
      code: comp.code || "",
      name: comp.name || "",
      level: comp.level || "",
      learningArea: comp.learningArea?.name || "",
      grade: comp.grade || "",
      evidence: comp.evidence || "",
    });
  });

  // Auto-fit columns
  worksheet.columns.forEach((column) => {
    column.width = Math.max(column.header.length, 15);
  });

  return await workbook.xlsx.writeBuffer();
};
