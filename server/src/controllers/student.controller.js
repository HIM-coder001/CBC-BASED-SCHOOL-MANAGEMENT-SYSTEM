import prisma from "../../prisma/client.js";
import { success, error } from "../utils/response.js";

export const getMyStudentRecord = async (req, res) => {
  try {
    const student = await prisma.student.findUnique({
      where: { userId: Number(req.user.id) },
      include: { class: true, user: true },
    });
    if (!student) return error(res, "Student record not found for this user", 404);
    return success(res, student, "Student record fetched successfully");
  } catch (err) {
    return error(res, err.message);
  }
};

export const createStudent = async (req, res) => {
  try {
    const schoolId = req.user.schoolId;
    const { admissionNo, fullName, gender, dob, classId, parentId, userId, nemisUpi } = req.body;

    const student = await prisma.student.create({
      data: {
        admissionNo,
        fullName,
        gender,
        dob: new Date(dob),
        schoolId,
        ...(classId  && { classId:  Number(classId)  }),
        ...(parentId && { parentId: Number(parentId) }),
        ...(userId   && { userId:   Number(userId)   }),
        ...(nemisUpi && { nemisUpi }),
      },
      include: { class: true, user: true },
    });
    return success(res, student, "Student created successfully");
  } catch (err) {
    if (err.code === "P2002") return error(res, "Admission number already exists", 400);
    return error(res, err.message);
  }
};

export const getStudentById = async (req, res) => {
  try {
    const student = await prisma.student.findUnique({
      where: { id: Number(req.params.id) },
      include: { class: true, user: true, parent: true },
    });
    if (!student) return error(res, "Student not found", 404);
    // Enforce tenant isolation
    if (student.schoolId !== req.user.schoolId) return error(res, "Student not found", 404);
    return success(res, student, "Student fetched successfully");
  } catch (err) {
    return error(res, err.message);
  }
};

export const getStudents = async (req, res) => {
  try {
    const { search } = req.query;
    const { skip, take, page, limit } = req.pagination;
    const schoolId = req.user.schoolId;

    const where = { schoolId, ...(search && {
      OR: [
        { fullName:    { contains: search } },
        { admissionNo: { contains: search } },
      ],
    }) };

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        include: { class: true, user: true },
        skip,
        take,
        orderBy: { fullName: "asc" },
      }),
      prisma.student.count({ where }),
    ]);
    return success(res, { students, total, page, limit }, "Students fetched successfully");
  } catch (err) {
    return error(res, err.message);
  }
};

export const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;

    // Confirm the record belongs to this school before updating
    const existing = await prisma.student.findUnique({ where: { id: Number(id) } });
    if (!existing || existing.schoolId !== req.user.schoolId) return error(res, "Student not found", 404);

    const { admissionNo, fullName, gender, dob, classId, parentId, nemisUpi } = req.body;
    const updated = await prisma.student.update({
      where: { id: Number(id) },
      data: {
        ...(admissionNo && { admissionNo }),
        ...(fullName    && { fullName }),
        ...(gender      && { gender }),
        ...(dob         && { dob: new Date(dob) }),
        ...(classId  !== undefined && { classId:  classId  ? Number(classId)  : null }),
        ...(parentId !== undefined && { parentId: parentId ? Number(parentId) : null }),
        ...(nemisUpi !== undefined && { nemisUpi }),
      },
      include: { class: true, user: true },
    });
    return success(res, updated, "Student updated successfully");
  } catch (err) {
    if (err.code === "P2025") return error(res, "Record not found", 404);
    if (err.code === "P2002") return error(res, "Admission number already exists", 400);
    return error(res, err.message);
  }
};

export const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const studentId = Number(id);

    // Confirm ownership before delete
    const existing = await prisma.student.findUnique({ where: { id: studentId } });
    if (!existing || existing.schoolId !== req.user.schoolId) return error(res, "Student not found", 404);

    await prisma.$transaction([
      prisma.feePayment.deleteMany({ where: { studentId } }),
      prisma.feeInvoice.deleteMany({ where: { studentId } }),
      prisma.skillAssessment.deleteMany({ where: { studentId } }),
      prisma.competency.deleteMany({ where: { studentId } }),
      prisma.learnerProfile.deleteMany({ where: { studentId } }),
      prisma.studentAssignment.deleteMany({ where: { studentId } }),
      prisma.attendance.deleteMany({ where: { studentId } }),
      prisma.assessment.deleteMany({ where: { studentId } }),
      prisma.reportCard.deleteMany({ where: { studentId } }),
      prisma.disciplineRecord.deleteMany({ where: { studentId } }),
      prisma.studentRoute.deleteMany({ where: { studentId } }),
      prisma.bookLoan.deleteMany({ where: { studentId } }),
      prisma.examResult.deleteMany({ where: { studentId } }),
      prisma.student.delete({ where: { id: studentId } }),
    ]);

    return success(res, null, "Student deleted successfully");
  } catch (err) {
    if (err.code === "P2025") return error(res, "Record not found", 404);
    return error(res, err.message);
  }
};
