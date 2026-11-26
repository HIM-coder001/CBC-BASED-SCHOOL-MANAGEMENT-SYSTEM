import ExcelJS from "exceljs";
import bcrypt from "bcryptjs";
import prisma from "../../prisma/client.js";
import { success, error } from "../utils/response.js";

const parseSheet = async (buffer) => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const sheet = workbook.worksheets[0];
  const rows = [];
  const headers = [];
  sheet.getRow(1).eachCell((cell, col) => { headers[col] = String(cell.value ?? "").trim().toLowerCase(); });
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const obj = {};
    row.eachCell((cell, col) => { obj[headers[col]] = cell.value; });
    if (Object.values(obj).some((v) => v != null && v !== "")) rows.push(obj);
  });
  return rows;
};

export const importStudents = async (req, res) => {
  try {
    if (!req.file) return error(res, "Excel file required", 400);
    const rows = await parseSheet(req.file.buffer);
    const results = { created: 0, errors: [] };

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const admissionNo = String(r.admissionno ?? r["admission no"] ?? r.admission ?? "").trim();
      const fullName = String(r.fullname ?? r.name ?? "").trim();
      const gender = String(r.gender ?? "M").trim();
      const dob = r.dob ?? r.dateofbirth ?? "2015-01-01";
      if (!admissionNo || !fullName) {
        results.errors.push({ row: i + 2, message: "Missing admissionNo or fullName" });
        continue;
      }
      try {
        await prisma.student.create({
          data: {
            admissionNo,
            fullName,
            gender,
            dob: new Date(dob),
            nemisUpi: r.nemisupi ? String(r.nemisupi) : undefined,
            schoolId: req.user.schoolId ?? 1,
          },
        });
        results.created++;
      } catch (e) {
        results.errors.push({ row: i + 2, message: e.message });
      }
    }

    await prisma.importJob.create({
      data: { type: "STUDENTS", status: "COMPLETED", errors: results.errors, createdById: req.user.id },
    });
    return success(res, results, "Import completed");
  } catch (err) {
    return error(res, err.message);
  }
};

export const importTeachers = async (req, res) => {
  try {
    if (!req.file) return error(res, "Excel file required", 400);
    const rows = await parseSheet(req.file.buffer);
    const results = { created: 0, errors: [] };
    const hashed = await bcrypt.hash("password", 10);

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const email = String(r.email ?? "").trim().toLowerCase();
      const fullName = String(r.fullname ?? r.name ?? "").trim();
      const tscNo = String(r.tscno ?? r.tsc ?? "").trim();
      const phone = String(r.phone ?? "").trim();
      const subject = String(r.subject ?? "General").trim();
      if (!email || !fullName || !tscNo) {
        results.errors.push({ row: i + 2, message: "Missing email, fullName, or tscNo" });
        continue;
      }
      try {
        const user = await prisma.user.create({
          data: { fullName, email, password: hashed, role: "TEACHER", schoolId: req.user.schoolId ?? 1 },
        });
        await prisma.teacher.create({
          data: { fullName, email, tscNo, phone: phone || "0700000000", subject, userId: user.id, schoolId: req.user.schoolId ?? 1 },
        });
        results.created++;
      } catch (e) {
        results.errors.push({ row: i + 2, message: e.message });
      }
    }

    await prisma.importJob.create({
      data: { type: "TEACHERS", status: "COMPLETED", errors: results.errors, createdById: req.user.id },
    });
    return success(res, results, "Import completed");
  } catch (err) {
    return error(res, err.message);
  }
};

export const getImportJobs = async (req, res) => {
  try {
    const jobs = await prisma.importJob.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { createdBy: { select: { fullName: true } } },
    });
    return success(res, jobs, "Import jobs fetched");
  } catch (err) {
    return error(res, err.message);
  }
};
