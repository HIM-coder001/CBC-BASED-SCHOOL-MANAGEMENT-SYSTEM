// Validation middleware for input validation
export const validateEmail = (req, res, next) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (req.body.email && !emailRegex.test(req.body.email)) {
    return res.status(400).json({
      success: false,
      message: "Invalid email format",
    });
  }
  next();
};

export const validatePassword = (req, res, next) => {
  if (req.body.password && req.body.password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 6 characters",
    });
  }
  next();
};

export const validatePhone = (req, res, next) => {
  const phoneRegex = /^(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/;
  
  if (req.body.phone && !phoneRegex.test(req.body.phone)) {
    return res.status(400).json({
      success: false,
      message: "Invalid phone number format",
    });
  }
  next();
};

export const validateRequiredFields = (requiredFields) => {
  return (req, res, next) => {
    const missingFields = requiredFields.filter(
      (field) => !req.body[field] || req.body[field].toString().trim() === ""
    );

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }
    next();
  };
};

export const validateStudentData = (req, res, next) => {
  const { fullName, admissionNo, gender, dob } = req.body;

  if (!fullName || !admissionNo || !gender || !dob) {
    return res.status(400).json({
      success: false,
      message: "All student fields are required",
    });
  }

  if (!["MALE", "FEMALE", "OTHER"].includes(gender.toUpperCase())) {
    return res.status(400).json({
      success: false,
      message: "Gender must be MALE, FEMALE, or OTHER",
    });
  }

  const dateOfBirth = new Date(dob);
  const today = new Date();
  const age = today.getFullYear() - dateOfBirth.getFullYear();

  if (age < 3 || age > 25) {
    return res.status(400).json({
      success: false,
      message: "Student age must be between 3 and 25 years",
    });
  }

  next();
};

export const validateTeacherData = (req, res, next) => {
  const { tscNo, fullName, email, phone, subject, userId } = req.body;

  if (!tscNo || !fullName || !email || !phone || !subject || !userId) {
    return res.status(400).json({
      success: false,
      message: "All teacher fields are required",
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Invalid email format",
    });
  }

  next();
};

export const validateUserData = (req, res, next) => {
  const { fullName, email, password, role } = req.body;

  if (!fullName || !email || !password || !role) {
    return res.status(400).json({
      success: false,
      message: "All user fields are required",
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Invalid email format",
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 6 characters",
    });
  }

  if (!["ADMIN", "TEACHER", "STUDENT", "PARENT"].includes(role)) {
    return res.status(400).json({
      success: false,
      message: "Role must be ADMIN, TEACHER, STUDENT, or PARENT",
    });
  }

  next();
};

export const validateAttendanceData = (req, res, next) => {
  const { studentId, date, status, term, year } = req.body;

  if (!studentId || !date || !status || !term || !year) {
    return res.status(400).json({
      success: false,
      message: "All attendance fields are required",
    });
  }

  if (!["PRESENT", "ABSENT", "LATE", "EXCUSED"].includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Status must be PRESENT, ABSENT, LATE, or EXCUSED",
    });
  }

  next();
};

export const validateAssignmentData = (req, res, next) => {
  const { title, description, dueDate, term, teacherId, classId } = req.body;

  if (!title || !description || !dueDate || !term || !teacherId || !classId) {
    return res.status(400).json({
      success: false,
      message: "All assignment fields are required",
    });
  }

  const dueDateTime = new Date(dueDate);
  const today = new Date();

  if (dueDateTime < today) {
    return res.status(400).json({
      success: false,
      message: "Due date cannot be in the past",
    });
  }

  next();
};

export const validateAssessmentData = (req, res, next) => {
  const { studentId, subStrandId, score, term } = req.body;

  if (!studentId || !subStrandId || !score || !term) {
    return res.status(400).json({
      success: false,
      message: "All assessment fields are required",
    });
  }

  if (!["EE", "ME", "AE", "BE"].includes(score)) {
    return res.status(400).json({
      success: false,
      message: "Score must be EE, ME, AE, or BE",
    });
  }

  next();
};

export const validateCompetencyData = (req, res, next) => {
  const { code, name, description, grade, learningAreaId, studentId, level } = req.body;

  if (!code || !name || !description || !grade || !learningAreaId || !studentId || !level) {
    return res.status(400).json({
      success: false,
      message: "All competency fields are required",
    });
  }

  if (!["DEVELOPING", "PROFICIENT", "ADVANCED", "MASTERED"].includes(level)) {
    return res.status(400).json({
      success: false,
      message: "Level must be DEVELOPING, PROFICIENT, ADVANCED, or MASTERED",
    });
  }

  next();
};
