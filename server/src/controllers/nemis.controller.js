import prisma from "../../prisma/client.js";
import { success, error } from "../utils/response.js";

export const exportStudents = async (req, res) => {
  try {
    const students = await prisma.student.findMany({
      include: { class: true, parent: true },
      orderBy: { admissionNo: "asc" },
    });

    const rows = students.map((s) => ({
      admissionNo: s.admissionNo,
      fullName: s.fullName,
      gender: s.gender,
      dob: s.dob.toISOString().split("T")[0],
      nemisUpi: s.nemisUpi ?? "",
      class: s.class?.name ?? "",
      grade: s.class?.grade ?? "",
      parentName: s.parent?.fullName ?? "",
      parentPhone: s.parent?.phone ?? "",
    }));

    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", "attachment; filename=nemis-students.json");
    return res.send(JSON.stringify(rows, null, 2));
  } catch (err) {
    return error(res, err.message);
  }
};

export const exportTeachers = async (req, res) => {
  try {
    const teachers = await prisma.teacher.findMany({ orderBy: { tscNo: "asc" } });
    const rows = teachers.map((t) => ({
      tscNo: t.tscNo,
      fullName: t.fullName,
      email: t.email,
      phone: t.phone,
      subject: t.subject,
      nemisUpi: t.nemisUpi ?? "",
    }));

    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", "attachment; filename=nemis-teachers.json");
    return res.send(JSON.stringify(rows, null, 2));
  } catch (err) {
    return error(res, err.message);
  }
};

export const updateNemisUpi = async (req, res) => {
  try {
    const { type, id, nemisUpi } = req.body;
    if (!type || !id) return error(res, "type and id required", 400);

    if (type === "student") {
      const s = await prisma.student.update({
        where: { id: Number(id) },
        data: { nemisUpi },
      });
      return success(res, s, "Student NEMIS UPI updated");
    }
    if (type === "teacher") {
      const t = await prisma.teacher.update({
        where: { id: Number(id) },
        data: { nemisUpi },
      });
      return success(res, t, "Teacher NEMIS UPI updated");
    }
    return error(res, "Invalid type", 400);
  } catch (err) {
    if (err.code === "P2025") return error(res, "Not found", 404);
    return error(res, err.message);
  }
};
