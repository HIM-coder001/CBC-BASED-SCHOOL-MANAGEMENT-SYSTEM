import { z } from "zod";

/**
 * Express middleware factory.
 * Usage: router.post("/", validate(schemas.createStudent), controller)
 *
 * On failure returns 400 with the first validation message.
 * On success, the parsed (coerced + stripped) body replaces req.body.
 */
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const message = result.error.errors[0]?.message ?? "Validation error";
    return res.status(400).json({ success: false, message });
  }
  req.body = result.data; // replace with coerced, stripped data
  next();
};

// ── Reusable field definitions ────────────────────────────────────────────

const email    = z.string().email("Invalid email format").toLowerCase().trim();
const password = z.string().min(6, "Password must be at least 6 characters").trim();
const phone    = z.string().min(7, "Invalid phone number").trim();
const role     = z.enum(["ADMIN", "TEACHER", "STUDENT", "PARENT"], {
  errorMap: () => ({ message: "Role must be ADMIN, TEACHER, STUDENT, or PARENT" }),
});
const positiveInt = z.coerce.number().int().positive();
const optPositiveInt = z.coerce.number().int().positive().optional();

// ── Auth ──────────────────────────────────────────────────────────────────

export const schemas = {

  login: z.object({
    email,
    password: z.string().min(1, "Password is required"),
  }),

  forgotPassword: z.object({ email }),

  resetPassword: z.object({
    token:    z.string().min(1, "Token is required"),
    password,
  }),

  adminResetPassword: z.object({
    userId:   positiveInt,
    password,
  }),

  // ── Users ───────────────────────────────────────────────────────────────

  createUser: z.object({
    fullName: z.string().min(2, "Full name must be at least 2 characters").trim(),
    email,
    password,
    role,
    schoolId: optPositiveInt,
  }),

  updateUser: z.object({
    fullName: z.string().min(2).trim().optional(),
    email:    email.optional(),
    password: password.optional(),
    role:     role.optional(),
  }).refine((d) => Object.keys(d).length > 0, { message: "No fields to update" }),

  // ── Students ─────────────────────────────────────────────────────────────

  createStudent: z.object({
    admissionNo: z.string().min(1, "Admission number is required").trim(),
    fullName:    z.string().min(2, "Full name is required").trim(),
    gender:      z.enum(["MALE", "FEMALE", "OTHER"], {
                   errorMap: () => ({ message: "Gender must be MALE, FEMALE, or OTHER" }),
                 }),
    dob:         z.coerce.date({ errorMap: () => ({ message: "Invalid date of birth" }) })
                   .refine((d) => {
                     const age = (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
                     return age >= 3 && age <= 25;
                   }, "Student age must be between 3 and 25 years"),
    classId:     optPositiveInt,
    parentId:    optPositiveInt,
    userId:      optPositiveInt,
    nemisUpi:    z.string().trim().optional(),
  }),

  updateStudent: z.object({
    admissionNo: z.string().min(1).trim().optional(),
    fullName:    z.string().min(2).trim().optional(),
    gender:      z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
    dob:         z.coerce.date().optional(),
    classId:     z.coerce.number().int().positive().nullable().optional(),
    parentId:    z.coerce.number().int().positive().nullable().optional(),
    nemisUpi:    z.string().trim().optional(),
  }),

  // ── Teachers ─────────────────────────────────────────────────────────────

  createTeacher: z.object({
    tscNo:   z.string().min(1, "TSC number is required").trim(),
    fullName:z.string().min(2, "Full name is required").trim(),
    email,
    phone,
    subject: z.string().min(1, "Subject is required").trim(),
    userId:  positiveInt,
    classId: optPositiveInt,
    nemisUpi:z.string().trim().optional(),
  }),

  updateTeacher: z.object({
    tscNo:   z.string().min(1).trim().optional(),
    fullName:z.string().min(2).trim().optional(),
    email:   email.optional(),
    phone:   phone.optional(),
    subject: z.string().min(1).trim().optional(),
    classId: z.coerce.number().int().positive().nullable().optional(),
    nemisUpi:z.string().trim().optional(),
  }),

  // ── Classes ───────────────────────────────────────────────────────────────

  createClass: z.object({
    name:   z.string().min(1, "Class name is required").trim(),
    grade:  z.string().min(1, "Grade is required").trim(),
    stream: z.string().trim().optional(),
  }),

  updateClass: z.object({
    name:   z.string().min(1).trim().optional(),
    grade:  z.string().min(1).trim().optional(),
    stream: z.string().trim().optional(),
  }),

  // ── Parents ───────────────────────────────────────────────────────────────

  createParent: z.object({
    fullName:   z.string().min(2, "Full name is required").trim(),
    email,
    phone,
    occupation: z.string().trim().optional(),
    userId:     positiveInt,
  }),

  updateParent: z.object({
    fullName:   z.string().min(2).trim().optional(),
    email:      email.optional(),
    phone:      phone.optional(),
    occupation: z.string().trim().optional(),
  }),

  // ── Attendance ────────────────────────────────────────────────────────────

  createAttendance: z.object({
    studentId: positiveInt,
    date:      z.coerce.date({ errorMap: () => ({ message: "Invalid date" }) }),
    status:    z.enum(["PRESENT", "ABSENT", "LATE", "EXCUSED"], {
                 errorMap: () => ({ message: "Status must be PRESENT, ABSENT, LATE, or EXCUSED" }),
               }),
    term:      z.string().min(1, "Term is required").trim(),
    year:      z.coerce.number().int().min(2000).max(2100),
    remarks:   z.string().trim().optional(),
  }),

  updateAttendance: z.object({
    status:  z.enum(["PRESENT", "ABSENT", "LATE", "EXCUSED"]).optional(),
    remarks: z.string().trim().optional(),
  }),

  // ── Assignments ───────────────────────────────────────────────────────────

  createAssignment: z.object({
    title:       z.string().min(1, "Title is required").trim(),
    description: z.string().min(1, "Description is required"),
    dueDate:     z.coerce.date({ errorMap: () => ({ message: "Invalid due date" }) })
                   .refine((d) => d > new Date(), "Due date must be in the future"),
    term:        z.string().min(1, "Term is required").trim(),
    teacherId:   positiveInt,
    classId:     positiveInt,
  }),

  // ── Assessments ───────────────────────────────────────────────────────────

  createAssessment: z.object({
    studentId:      positiveInt,
    subStrandId:    positiveInt,
    score:          z.enum(["EE", "ME", "AE", "BE"], {
                      errorMap: () => ({ message: "Score must be EE, ME, AE, or BE" }),
                    }),
    term:           z.string().min(1, "Term is required").trim(),
    assessmentType: z.enum(["FORMATIVE", "SUMMATIVE", "PRACTICAL", "PROJECT"]).optional(),
  }),

  bulkCreateAssessments: z.object({
    subStrandId:    positiveInt,
    term:           z.string().min(1, "Term is required").trim(),
    assessmentType: z.enum(["FORMATIVE", "SUMMATIVE", "PRACTICAL", "PROJECT"]).optional(),
    entries: z.array(z.object({
      studentId: positiveInt,
      score:     z.enum(["EE", "ME", "AE", "BE"], {
                   errorMap: () => ({ message: "Score must be EE, ME, AE, or BE" }),
                 }),
    })).min(1, "At least one entry is required"),
  }),

  // ── Fees ──────────────────────────────────────────────────────────────────

  createFeeStructure: z.object({
    grade:       z.string().min(1, "Grade is required").trim(),
    term:        z.string().min(1, "Term is required").trim(),
    year:        z.coerce.number().int().min(2000).max(2100),
    amount:      z.coerce.number().positive("Amount must be positive"),
    description: z.string().trim().optional(),
  }),

  recordPayment: z.object({
    studentId: positiveInt,
    amount:    z.coerce.number().positive("Amount must be positive"),
    method:    z.enum(["MPESA", "CASH", "BANK"]).optional(),
    mpesaRef:  z.string().trim().optional(),
    notes:     z.string().trim().optional(),
    term:      z.string().min(1, "Term is required").trim(),
    year:      z.coerce.number().int().min(2000).max(2100),
  }),

  initiateMpesaPayment: z.object({
    studentId: positiveInt,
    amount:    z.coerce.number().positive("Amount must be positive"),
    phone:     z.string().regex(/^(?:\+?254|0)[17]\d{8}$/, "Invalid Kenyan phone number"),
    term:      z.string().min(1, "Term is required").trim(),
    year:      z.coerce.number().int().min(2000).max(2100),
  }),

  // ── Competencies ──────────────────────────────────────────────────────────

  createCompetency: z.object({
    code:          z.string().min(1, "Code is required").trim(),
    name:          z.string().min(1, "Name is required").trim(),
    description:   z.string().min(1, "Description is required"),
    grade:         z.string().min(1, "Grade is required").trim(),
    learningAreaId:positiveInt,
    studentId:     positiveInt,
    level:         z.enum(["DEVELOPING", "PROFICIENT", "ADVANCED", "MASTERED"], {
                     errorMap: () => ({ message: "Level must be DEVELOPING, PROFICIENT, ADVANCED, or MASTERED" }),
                   }),
    evidence:      z.string().trim().optional(),
  }),

  // ── Learner Profiles ──────────────────────────────────────────────────────

  createLearnerProfile: z.object({
    studentId: positiveInt,
    term:      z.string().min(1, "Term is required").trim(),
    year:      z.string().min(4, "Year is required").trim(),
    category:  z.enum(
                 ["COMMUNICATION","CRITICAL_THINKING","CREATIVITY","CITIZENSHIP","DIGITAL_LITERACY","SELF_MANAGEMENT"],
                 { errorMap: () => ({ message: "Invalid profile category" }) }
               ),
    level:     z.enum(["BEGINNING","DEVELOPING","PROFICIENT","ADVANCED","MASTERED"], {
                 errorMap: () => ({ message: "Invalid profile level" }),
               }),
    comments:  z.string().trim().optional(),
  }),

  // ── Report Cards ──────────────────────────────────────────────────────────

  generateReportCard: z.object({
    studentId:        positiveInt,
    term:             z.string().min(1, "Term is required").trim(),
    year:             z.string().min(4, "Year is required").trim(),
    teacherRemark:    z.string().trim().optional(),
    principalRemark:  z.string().trim().optional(),
    strengths:        z.string().trim().optional(),
    nextSteps:        z.string().trim().optional(),
  }),

  // ── Messages ──────────────────────────────────────────────────────────────

  sendParentMessage: z.object({
    teacherId: positiveInt,
    subject:   z.string().min(1, "Subject is required").trim(),
    content:   z.string().min(1, "Content is required"),
  }),
};
