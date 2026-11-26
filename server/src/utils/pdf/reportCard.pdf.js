import PDFDocument from "pdfkit";

const SCORE_PCT  = { EE: 90, ME: 75, AE: 60, BE: 45 };
const SCORE_RANK = { EE: 4,  ME: 3,  AE: 2,  BE: 1  };

const C = {
  navy: "#1e3a5f", indigo: "#3730a3", blue: "#2563eb",
  lightBg: "#f8fafc", border: "#e2e8f0", text: "#1e293b", muted: "#64748b", white: "#ffffff",
  ee: "#15803d", eeBg: "#dcfce7",
  me: "#1d4ed8", meBg: "#dbeafe",
  ae: "#a16207", aeBg: "#fef9c3",
  be: "#b91c1c", beBg: "#fee2e2",
};

const scoreColor = sc => ({ EE: C.ee, ME: C.me, AE: C.ae, BE: C.be }[sc] ?? C.muted);
const scoreBg    = sc => ({ EE: C.eeBg, ME: C.meBg, AE: C.aeBg, BE: C.beBg }[sc] ?? "#f1f5f9");

const fillRect   = (doc, x, y, w, h, color) => doc.save().rect(x, y, w, h).fill(color).restore();
const strokeRect = (doc, x, y, w, h, color = C.border, lw = 0.5) =>
  doc.save().lineWidth(lw).rect(x, y, w, h).stroke(color).restore();
const hLine = (doc, x, y, w, color = C.border, lw = 0.5) =>
  doc.save().lineWidth(lw).moveTo(x, y).lineTo(x + w, y).stroke(color).restore();

function text(doc, str, x, y, opts = {}) {
  const { font = "Helvetica", size = 9, color = C.text, width, align = "left", lineBreak = false } = opts;
  doc.save().font(font).fontSize(size).fillColor(color)
    .text(String(str ?? "—"), x, y, { width, align, lineBreak })
    .restore();
}

export const generateReportPDF = (data, res) => {
  const doc = new PDFDocument({ margin: 0, size: "A4" });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition",
    `attachment; filename=report-card-${data.student?.admissionNo ?? "student"}.pdf`);
  doc.pipe(res);

  const PW = 595.28, PH = 841.89, ML = 40, CW = PW - 80;
  let y = 0;

  // Header
  fillRect(doc, 0, 0, PW, 80, C.navy);
  fillRect(doc, 0, 60, PW, 20, C.indigo);

  const school     = data.schoolSettings ?? {};
  const schoolName = school.schoolName ?? "SchoolHub CBC Academy";
  const schoolSub  = [school.address, school.county].filter(Boolean).join("  ·  ")
    || "Competency Based Curriculum — Student Progress Report Card";

  if (school.logoUrl) {
    try { doc.image(school.logoUrl, ML, 14, { width: 50, height: 50 }); } catch {}
  }

  text(doc, schoolName, ML, 16, { font: "Helvetica-Bold", size: 18, color: C.white, width: CW, align: "center" });
  text(doc, schoolSub,  ML, 38, { size: 8.5, color: "#93c5fd", width: CW, align: "center" });

  const pillW = 110, pillH = 18, pillX = (PW - pillW) / 2, pillY = 56;
  doc.save().roundedRect(pillX, pillY, pillW, pillH, 9).fill(C.blue).restore();
  text(doc, `Term ${data.term}  ·  ${data.year}`, pillX, pillY + 4,
    { font: "Helvetica-Bold", size: 8, color: C.white, width: pillW, align: "center" });

  y = 88;

  // Student info
  const infoH = 60;
  fillRect(doc, ML, y, CW, infoH, "#eff6ff");
  strokeRect(doc, ML, y, CW, infoH, "#bfdbfe", 1);

  const row1 = [["Student Name", data.student?.fullName], ["Admission No.", data.student?.admissionNo], ["Class / Grade", data.student?.class?.name], ["Stream", data.student?.class?.stream]];
  const row2 = [["Academic Year", data.year], ["Term", `Term ${data.term}`], ["Class Teacher", data.classTeacher], ["Gender", data.student?.gender]];
  const colW = CW / 4;

  row1.forEach(([label, val], i) => {
    const fx = ML + i * colW + 8;
    text(doc, label, fx, y + 8,  { size: 7, color: C.muted });
    text(doc, val ?? "—", fx, y + 20, { font: "Helvetica-Bold", size: 9.5, color: C.text, width: colW - 12 });
  });
  row2.forEach(([label, val], i) => {
    const fx = ML + i * colW + 8;
    text(doc, label, fx, y + 36, { size: 7, color: C.muted });
    text(doc, val ?? "—", fx, y + 47, { font: "Helvetica-Bold", size: 9, color: C.text, width: colW - 12 });
  });

  y += infoH + 14;

  // Learning areas table
  text(doc, "LEARNING AREAS PERFORMANCE", ML, y, { font: "Helvetica-Bold", size: 10, color: C.navy });
  hLine(doc, ML, y + 13, CW, C.blue, 1.5);
  y += 20;

  const tCols = {
    subject: { x: ML,       w: 185 },
    score:   { x: ML + 185, w: 55  },
    pct:     { x: ML + 240, w: 55  },
    level:   { x: ML + 295, w: 65  },
    teacher: { x: ML + 360, w: CW - 360 },
  };
  const rowH = 22;

  fillRect(doc, ML, y, CW, rowH, C.navy);
  [["Learning Area", tCols.subject, "left"], ["Score", tCols.score, "center"],
   ["Percentage", tCols.pct, "center"], ["CBC Level", tCols.level, "center"],
   ["Teacher", tCols.teacher, "left"]].forEach(([lbl, col, align]) => {
    text(doc, lbl, col.x + 4, y + 7, { font: "Helvetica-Bold", size: 8, color: C.white, width: col.w - 8, align });
  });
  y += rowH;

  const areas = data.learningAreas ?? [];
  areas.forEach((area, idx) => {
    fillRect(doc, ML, y, CW, rowH, idx % 2 === 0 ? C.white : C.lightBg);
    text(doc, area.name, tCols.subject.x + 6, y + 7, { size: 8.5, width: tCols.subject.w - 10 });
    text(doc, area.score ?? "—", tCols.score.x, y + 7,
      { font: "Helvetica-Bold", size: 9, color: scoreColor(area.score), width: tCols.score.w, align: "center" });
    text(doc, `${SCORE_PCT[area.score] ?? 0}%`, tCols.pct.x, y + 7,
      { font: "Helvetica-Bold", size: 9, width: tCols.pct.w, align: "center" });

    const bw = 58, bh = 14, bx = tCols.level.x + (tCols.level.w - bw) / 2, by = y + (rowH - bh) / 2;
    doc.save().roundedRect(bx, by, bw, bh, 7).fill(scoreBg(area.score)).restore();
    const lvl = { EE: "Exceeds", ME: "Meets", AE: "Approaches", BE: "Below" }[area.score] ?? area.score;
    text(doc, lvl, bx, by + 3, { font: "Helvetica-Bold", size: 7.5, color: scoreColor(area.score), width: bw, align: "center" });

    text(doc, area.teacher ?? "—", tCols.teacher.x + 4, y + 7, { size: 8, color: C.muted, width: tCols.teacher.w - 8 });
    hLine(doc, ML, y + rowH, CW, C.border);
    y += rowH;
  });

  strokeRect(doc, ML, y - areas.length * rowH - rowH, CW, (areas.length + 1) * rowH, C.border, 0.8);
  y += 14;

  // Summary + attendance
  const sumW = (CW - 10) / 2;
  fillRect(doc, ML, y, sumW, 70, C.lightBg);
  strokeRect(doc, ML, y, sumW, 70, C.border);
  text(doc, "PERFORMANCE SUMMARY", ML + 8, y + 8, { font: "Helvetica-Bold", size: 9, color: C.navy });

  const avg    = areas.length > 0 ? (areas.reduce((s, a) => s + (SCORE_RANK[a.score] ?? 1), 0) / areas.length).toFixed(2) : "0.00";
  const avgPct = areas.length > 0 ? Math.round(areas.reduce((s, a) => s + (SCORE_PCT[a.score] ?? 0), 0) / areas.length) : 0;
  const og     = data.overallGrade ?? "—";

  text(doc, "Average Score:", ML + 8, y + 24, { size: 8.5, color: C.muted });
  text(doc, `${avgPct}%  (${avg}/4.00)`, ML + 90, y + 24, { font: "Helvetica-Bold", size: 9 });
  text(doc, "Overall Grade:", ML + 8, y + 38, { size: 8.5, color: C.muted });
  text(doc, og, ML + 90, y + 38, { font: "Helvetica-Bold", size: 14, color: { A: C.ee, B: C.me, C: C.ae, D: C.be }[og] ?? C.muted });
  text(doc, "Remark:", ML + 8, y + 54, { size: 8.5, color: C.muted });
  text(doc, data.remark ?? "—", ML + 90, y + 54, { size: 8.5, width: sumW - 95 });

  const att = data.attendance ?? {}, attX = ML + sumW + 10;
  fillRect(doc, attX, y, sumW, 70, C.lightBg);
  strokeRect(doc, attX, y, sumW, 70, C.border);
  text(doc, "ATTENDANCE", attX + 8, y + 8, { font: "Helvetica-Bold", size: 9, color: C.navy });

  [["Days Present", att.present, C.ee], ["Days Absent", att.absent, C.be], ["Total Days", att.total, C.blue]].forEach(([label, val, color], i) => {
    const ax = attX + i * (sumW / 3) + 4;
    text(doc, String(val ?? "—"), ax, y + 26, { font: "Helvetica-Bold", size: 18, color, width: sumW / 3 - 8, align: "center" });
    text(doc, label, ax, y + 48, { size: 7, color: C.muted, width: sumW / 3 - 8, align: "center" });
  });

  if (att.total && att.present !== undefined) {
    const attPct = Math.round((att.present / att.total) * 100);
    text(doc, `Attendance Rate: ${attPct}%`, attX + 8, y + 58,
      { font: "Helvetica-Bold", size: 8, color: attPct >= 75 ? C.ee : C.ae, width: sumW - 16, align: "center" });
  }

  y += 84;

  if (data.learnerProfileSummary) {
    text(doc, "LEARNER PROFILE SUMMARY", ML, y, { font: "Helvetica-Bold", size: 9, color: C.navy });
    hLine(doc, ML, y + 12, CW, C.border);
    y += 18;
    text(doc, data.learnerProfileSummary, ML, y, { size: 8.5, width: CW });
    y += 22;
  }

  if (data.strengths || data.nextSteps) {
    const cardW = (CW - 12) / 2;
    const cardH = 62;

    if (data.strengths) {
      fillRect(doc, ML, y, cardW, cardH, "#eff6ff");
      strokeRect(doc, ML, y, cardW, cardH, "#bfdbfe");
      text(doc, "STRENGTHS", ML + 8, y + 8, { font: "Helvetica-Bold", size: 8, color: C.navy });
      text(doc, data.strengths, ML + 8, y + 24, { size: 8, width: cardW - 16, lineBreak: true });
    }

    if (data.nextSteps) {
      const rx = ML + cardW + 12;
      fillRect(doc, rx, y, cardW, cardH, "#f7fee7");
      strokeRect(doc, rx, y, cardW, cardH, "#d9f99d");
      text(doc, "NEXT STEPS", rx + 8, y + 8, { font: "Helvetica-Bold", size: 8, color: "#166534" });
      text(doc, data.nextSteps, rx + 8, y + 24, { size: 8, width: cardW - 16, lineBreak: true });
    }

    y += cardH + 14;
  }

  // Core competencies
  if (data.competencies?.length) {
    text(doc, "CORE COMPETENCIES", ML, y, { font: "Helvetica-Bold", size: 9, color: C.navy });
    hLine(doc, ML, y + 12, CW, C.border);
    y += 18;
    let cx = ML, cy = y;
    data.competencies.forEach(comp => {
      const cw = doc.widthOfString(comp, { fontSize: 7.5 }) + 16;
      if (cx + cw > ML + CW) { cx = ML; cy += 18; }
      doc.save().roundedRect(cx, cy, cw, 14, 7).fill("#e0e7ff").restore();
      text(doc, comp, cx + 8, cy + 3, { size: 7.5, color: "#3730a3" });
      cx += cw + 6;
    });
    y = cy + 22;
  }

  // Remarks
  if (data.teacherRemark || data.principalRemark) {
    const remW = (CW - 10) / 2;
    if (data.teacherRemark) {
      fillRect(doc, ML, y, remW, 60, "#eff6ff");
      strokeRect(doc, ML, y, remW, 60, "#bfdbfe");
      text(doc, "CLASS TEACHER'S REMARK", ML + 8, y + 8, { font: "Helvetica-Bold", size: 8, color: C.navy });
      text(doc, data.teacherRemark, ML + 8, y + 22, { size: 8, width: remW - 16, lineBreak: true });
    }
    if (data.principalRemark) {
      const rx = ML + remW + 10;
      fillRect(doc, rx, y, remW, 60, "#f0fdf4");
      strokeRect(doc, rx, y, remW, 60, "#bbf7d0");
      text(doc, "PRINCIPAL'S REMARK", rx + 8, y + 8, { font: "Helvetica-Bold", size: 8, color: "#14532d" });
      text(doc, data.principalRemark, rx + 8, y + 22, { size: 8, width: remW - 16, lineBreak: true });
    }
    y += 70;
  }

  // Signatures
  hLine(doc, ML, y, CW, C.border);
  y += 14;
  const sigW = CW / 3;
  [["Class Teacher", data.classTeacher], ["Headteacher / Principal", data.principal], ["Parent / Guardian", ""]].forEach(([label, name], i) => {
    const sx = ML + i * sigW;
    text(doc, label, sx, y, { size: 7.5, color: C.muted, width: sigW - 10 });
    if (name) text(doc, name, sx, y + 10, { font: "Helvetica-Bold", size: 8.5, width: sigW - 10 });
    hLine(doc, sx, y + 28, sigW - 20, C.border, 0.8);
    text(doc, "Signature & Date", sx, y + 32, { size: 7, color: C.muted });
  });
  y += 50;

  // Score key
  hLine(doc, ML, y, CW, C.border);
  y += 8;
  text(doc, "CBC SCORE KEY:", ML, y, { size: 7.5, color: C.muted });
  let kx = ML + 80;
  [{ code: "EE", label: "Exceeds Expectations (90%+)", color: C.ee, bg: C.eeBg },
   { code: "ME", label: "Meets Expectations (75–89%)",  color: C.me, bg: C.meBg },
   { code: "AE", label: "Approaches Expectations (60–74%)", color: C.ae, bg: C.aeBg },
   { code: "BE", label: "Below Expectations (<60%)",    color: C.be, bg: C.beBg }].forEach(k => {
    const kw = doc.widthOfString(`${k.code} — ${k.label}`, { fontSize: 7 }) + 14;
    doc.save().roundedRect(kx, y - 1, kw, 13, 6).fill(k.bg).restore();
    text(doc, `${k.code} — ${k.label}`, kx + 7, y + 2, { font: "Helvetica-Bold", size: 7, color: k.color });
    kx += kw + 6;
  });

  // Footer
  fillRect(doc, 0, PH - 24, PW, 24, C.navy);
  text(doc,
    `Generated by ${school.schoolName ?? "SchoolHub"} CBC Management System  ·  ${new Date().toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric" })}`,
    0, PH - 16, { size: 7.5, color: "#93c5fd", width: PW, align: "center" });

  doc.end();
};
