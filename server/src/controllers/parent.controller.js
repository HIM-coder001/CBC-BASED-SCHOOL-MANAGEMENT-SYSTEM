import prisma from "../../prisma/client.js";
import { success, error } from "../utils/response.js";

// GET ALL PARENTS (for admin dropdowns)
export const getAllParents = async (req, res) => {
  try {
    const parents = await prisma.parent.findMany({
      where: { user: { schoolId: req.user.schoolId } },
      include: { user: true, students: true },
      orderBy: { fullName: "asc" },
    });
    return success(res, parents, "Parents fetched successfully");
  } catch (err) {
    return error(res, err.message);
  }
};

// CREATE PARENT
export const createParent = async (req, res) => {
  try {
    const { fullName, email, phone, occupation, userId } = req.body;

    const parent = await prisma.parent.create({
      data: {
        fullName,
        email,
        phone,
        occupation,
        userId: Number(userId),
      },
      include: {
        students: {
          include: {
            class: true,
          },
        },
        user: true,
      },
    });

    return success(res, parent, "Parent created successfully");
  } catch (err) {
    if (err.code === "P2002") {
      return error(res, "Email or phone already exists", 400);
    }
    return error(res, err.message);
  }
};

// GET PARENT DETAILS
export const getParentDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const parent = await prisma.parent.findUnique({
      where: { id: Number(id) },
      include: {
        students: { include: { class: true, user: true } },
        user: true,
      },
    });

    if (!parent || parent.user?.schoolId !== req.user.schoolId) {
      return error(res, "Parent not found", 404);
    }

    return success(res, parent, "Parent details retrieved successfully");
  } catch (err) {
    return error(res, err.message);
  }
};

// GET CHILDREN GRADES
export const getChildrenGrades = async (req, res) => {
  try {
    const { parentId } = req.params;

    const parent = await prisma.parent.findUnique({
      where: { id: Number(parentId) },
      include: {
        students: {
          include: {
            reportCards: {
              orderBy: { createdAt: "desc" },
              take: 5,
            },
            assessments: {
              orderBy: { createdAt: "desc" },
              take: 10,
              include: {
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
            },
          },
        },
      },
    });

    if (!parent) {
      return error(res, "Parent not found", 404);
    }

    return success(res, parent.students, "Children grades retrieved successfully");
  } catch (err) {
    return error(res, err.message);
  }
};

export const getChildrenReportCards = async (req, res) => {
  try {
    const { parentId } = req.params;
    const parent = await prisma.parent.findUnique({
      where: { id: Number(parentId) },
      include: {
        students: {
          include: {
            reportCards: { orderBy: [{ year: "desc" }, { term: "desc" }] },
          },
        },
      },
    });
    if (!parent) return error(res, "Parent not found", 404);
    return success(res, parent.students, "Report cards fetched");
  } catch (err) {
    return error(res, err.message);
  }
};

// GET CHILDREN ATTENDANCE
export const getChildrenAttendance = async (req, res) => {
  try {
    const { parentId } = req.params;
    const { term, year } = req.query;

    const parent = await prisma.parent.findUnique({
      where: { id: Number(parentId) },
      include: {
        students: true,
      },
    });

    if (!parent) {
      return error(res, "Parent not found", 404);
    }

    const studentIds = parent.students.map((s) => s.id);

    let whereClause = { studentId: { in: studentIds } };

    if (term) whereClause.term = term;
    if (year) whereClause.year = Number(year);

    const attendance = await prisma.attendance.findMany({
      where: whereClause,
      include: {
        student: {
          include: {
            class: true,
          },
        },
      },
      orderBy: { date: "desc" },
    });

    const summary = {};
    parent.students.forEach((student) => {
      const studentAttendance = attendance.filter(
        (a) => a.studentId === student.id
      );
      summary[student.id] = {
        studentId: student.id,
        studentName: student.fullName,
        admissionNo: student.admissionNo,
        total: studentAttendance.length,
        present: studentAttendance.filter((a) => a.status === "PRESENT").length,
        absent: studentAttendance.filter((a) => a.status === "ABSENT").length,
        late: studentAttendance.filter((a) => a.status === "LATE").length,
        excused: studentAttendance.filter((a) => a.status === "EXCUSED").length,
        percentage:
          studentAttendance.length > 0
            ? (
                (studentAttendance.filter((a) => a.status === "PRESENT").length /
                  studentAttendance.length) *
                100
              ).toFixed(2)
            : 0,
      };
    });

    return success(res, summary, "Children attendance retrieved successfully");
  } catch (err) {
    return error(res, err.message);
  }
};

// GET CHILDREN ASSIGNMENTS
export const getChildrenAssignments = async (req, res) => {
  try {
    const { parentId } = req.params;
    const { status } = req.query;

    const parent = await prisma.parent.findUnique({
      where: { id: Number(parentId) },
      include: {
        students: true,
      },
    });

    if (!parent) {
      return error(res, "Parent not found", 404);
    }

    const studentIds = parent.students.map((s) => s.id);

    let whereClause = { studentId: { in: studentIds } };

    if (status === "submitted") whereClause.submitted = true;
    if (status === "pending") whereClause.submitted = false;

    const assignments = await prisma.studentAssignment.findMany({
      where: whereClause,
      include: {
        student: {
          include: {
            class: true,
          },
        },
        assignment: {
          include: {
            teacher: {
              include: {
                user: true,
              },
            },
            class: true,
          },
        },
      },
      orderBy: { assignment: { dueDate: "asc" } },
    });

    return success(res, assignments, "Children assignments retrieved successfully");
  } catch (err) {
    return error(res, err.message);
  }
};

// SEND MESSAGE TO TEACHER
export const sendMessageToTeacher = async (req, res) => {
  try {
    const { parentId } = req.params;
    const { teacherId, subject, content } = req.body;

    if (!teacherId || !subject || !content) {
      return error(res, "teacherId, subject, and content are required", 400);
    }

    const parent = await prisma.parent.findUnique({
      where: { id: Number(parentId) },
      include: { user: true },
    });
    if (!parent) return error(res, "Parent not found", 404);

    // teacherId is Teacher.id — we need the teacher's User.id for the message
    const teacher = await prisma.teacher.findUnique({
      where: { id: Number(teacherId) },
    });
    if (!teacher) return error(res, "Teacher not found", 404);

    const message = await prisma.message.create({
      data: {
        subject,
        content,
        senderId: parent.userId,
        recipientId: teacher.userId,   // ← User.id, not Teacher.id
        messageType: "INQUIRY",
      },
      include: { sender: true, recipient: true },
    });

    return success(res, message, "Message sent successfully");
  } catch (err) {
    return error(res, err.message);
  }
};

// GET MESSAGES
export const getMessages = async (req, res) => {
  try {
    const { parentId } = req.params;

    const parent = await prisma.parent.findUnique({
      where: { id: Number(parentId) },
      include: { user: true },
    });

    if (!parent) {
      return error(res, "Parent not found", 404);
    }

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: parent.userId },
          { recipientId: parent.userId },
        ],
      },
      include: {
        sender: true,
        recipient: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return success(res, messages, "Messages retrieved successfully");
  } catch (err) {
    return error(res, err.message);
  }
};

// MARK MESSAGE AS READ
export const markMessageAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const message = await prisma.message.update({
      where: { id: Number(id) },
      data: {
        isRead: true,
        readAt: new Date(),
      },
      include: {
        sender: true,
        recipient: true,
      },
    });

    return success(res, message, "Message marked as read");
  } catch (err) {
    return error(res, err.message);
  }
};

// UPDATE PARENT
export const updateParent = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, email, phone, occupation } = req.body;

    const updated = await prisma.parent.update({
      where: { id: Number(id) },
      data: {
        ...(fullName && { fullName }),
        ...(email && { email }),
        ...(phone && { phone }),
        ...(occupation && { occupation }),
      },
      include: {
        students: true,
        user: true,
      },
    });

    return success(res, updated, "Parent updated successfully");
  } catch (err) {
    return error(res, err.message);
  }
};

// GET PARENT BY USER ID (for logged-in parent)
export const getParentByUserId = async (req, res) => {
  try {
    const userId = req.user.id;
    const parent = await prisma.parent.findUnique({
      where: { userId: Number(userId) },
      include: {
        students: { include: { class: true, user: true } },
        user: true,
      },
    });
    if (!parent) return error(res, "Parent record not found", 404);
    return success(res, parent, "Parent details retrieved successfully");
  } catch (err) {
    return error(res, err.message);
  }
};

// DELETE PARENT
export const deleteParent = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.parent.delete({
      where: { id: Number(id) },
    });

    return success(res, null, "Parent deleted successfully");
  } catch (err) {
    return error(res, err.message);
  }
};
