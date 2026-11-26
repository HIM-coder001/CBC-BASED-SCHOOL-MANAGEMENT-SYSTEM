import prisma from "../../prisma/client.js";
import { success, error } from "../utils/response.js";

// CREATE ASSIGNMENT
export const createAssignment = async (req, res) => {
  try {
    const { title, description, dueDate, term, teacherId, classId } = req.body;

    // Verify class belongs to this school
    const cls = await prisma.class.findUnique({ where: { id: Number(classId) } });
    if (!cls || cls.schoolId !== req.user.schoolId) {
      return error(res, "Class not found", 404);
    }

    const assignment = await prisma.assignment.create({
      data: {
        title,
        description,
        dueDate: new Date(dueDate),
        term,
        teacherId: Number(teacherId),
        classId: Number(classId),
      },
      include: {
        teacher: { include: { user: true } },
        class: true,
      },
    });

    // Auto-enroll all students in the class
    const classStudents = await prisma.student.findMany({ where: { classId: Number(classId) } });
    if (classStudents.length > 0) {
      await prisma.studentAssignment.createMany({
        data: classStudents.map(s => ({ studentId: s.id, assignmentId: assignment.id, submitted: false })),
        skipDuplicates: true,
      });
    }

    return success(res, assignment, "Assignment created successfully");
  } catch (err) {
    return error(res, err.message);
  }
};

// GET ALL ASSIGNMENTS
export const getAssignments = async (req, res) => {
  try {
    const { classId, teacherId, term } = req.query;
    const schoolId = req.user.schoolId;

    // Always scope to the caller's school via the class relationship
    let whereClause = { class: { schoolId } };

    if (classId)   whereClause.classId   = Number(classId);
    if (teacherId) whereClause.teacherId = Number(teacherId);
    if (term)      whereClause.term      = term;

    const assignments = await prisma.assignment.findMany({
      where: whereClause,
      include: {
        teacher: { include: { user: true } },
        class: true,
        students: true,
      },
      orderBy: { dueDate: "asc" },
    });

    return success(res, assignments, "Assignments retrieved successfully");
  } catch (err) {
    return error(res, err.message);
  }
};

// GET STUDENT ASSIGNMENTS
export const getStudentAssignments = async (req, res) => {
  try {
    const { studentId } = req.params;

    const assignments = await prisma.studentAssignment.findMany({
      where: { studentId: Number(studentId) },
      include: {
        assignment: {
          include: {
            teacher: { include: { user: true } },
            class: true,
          },
        },
      },
      orderBy: { assignment: { dueDate: "asc" } },
    });

    return success(res, assignments, "Student assignments retrieved successfully");
  } catch (err) {
    return error(res, err.message);
  }
};

// SUBMIT ASSIGNMENT
export const submitAssignment = async (req, res) => {
  try {
    const { studentId, assignmentId } = req.params;

    const { submission: submissionText } = req.body;
    const submissionUrl = req.file ? `/uploads/${req.file.filename}` : req.body.submissionUrl;

    if ((!submissionText || String(submissionText).trim().length === 0) && !submissionUrl) {
      return error(res, "Submission text or file required", 400);
    }

    const submission = await prisma.studentAssignment.update({
      where: {
        studentId_assignmentId: {
          studentId: Number(studentId),
          assignmentId: Number(assignmentId),
        },
      },
      data: {
        submitted: true,
        submittedAt: new Date(),
        ...(submissionText && { submission: submissionText }),
        ...(submissionUrl && { submissionUrl }),
      },
      include: {
        assignment: true,
        student: true,
      },
    });

    return success(res, submission, "Assignment submitted successfully");
  } catch (err) {
    return error(res, err.message);
  }
};

// GRADE ASSIGNMENT
export const gradeAssignment = async (req, res) => {
  try {
    const { studentId, assignmentId } = req.params;
    const { grade, feedback } = req.body;

    const graded = await prisma.studentAssignment.update({
      where: {
        studentId_assignmentId: {
          studentId: Number(studentId),
          assignmentId: Number(assignmentId),
        },
      },
      data: {
        grade,
        feedback,
      },
      include: {
        assignment: true,
        student: true,
      },
    });

    return success(res, graded, "Assignment graded successfully");
  } catch (err) {
    return error(res, err.message);
  }
};

// UPDATE ASSIGNMENT
export const updateAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, dueDate, term } = req.body;

    const updated = await prisma.assignment.update({
      where: { id: Number(id) },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
        ...(term && { term }),
      },
      include: {
        teacher: { include: { user: true } },
        class: true,
      },
    });

    return success(res, updated, "Assignment updated successfully");
  } catch (err) {
    return error(res, err.message);
  }
};

// DELETE ASSIGNMENT
export const deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    // Delete all submissions first
    await prisma.studentAssignment.deleteMany({
      where: { assignmentId: Number(id) },
    });

    await prisma.assignment.delete({
      where: { id: Number(id) },
    });

    return success(res, null, "Assignment deleted successfully");
  } catch (err) {
    return error(res, err.message);
  }
};

// GET ASSIGNMENT STATISTICS
export const getAssignmentStats = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    const submissions = await prisma.studentAssignment.findMany({
      where: { assignmentId: Number(assignmentId) },
      include: { student: true },
    });

    const stats = {
      total: submissions.length,
      submitted: submissions.filter((s) => s.submitted).length,
      notSubmitted: submissions.filter((s) => !s.submitted).length,
      graded: submissions.filter((s) => s.grade).length,
      notGraded: submissions.filter((s) => !s.grade).length,
      submissions,
    };

    return success(res, stats, "Assignment statistics retrieved successfully");
  } catch (err) {
    return error(res, err.message);
  }
};
