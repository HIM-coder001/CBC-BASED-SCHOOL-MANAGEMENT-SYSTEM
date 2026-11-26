import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

import studentRoutes      from "./routes/student.routes.js";
import classRoutes        from "./routes/class.routes.js";
import teacherRoutes      from "./routes/teacher.routes.js";
import userRoutes         from "./routes/user.routes.js";
import authRoutes         from "./routes/auth.routes.js";
import assessmentRoutes   from "./routes/assessment.route.js";
import reportCardRoutes   from "./routes/reportCard.routes.js";
import attendanceRoutes   from "./routes/attendance.routes.js";
import assignmentRoutes   from "./routes/assignment.routes.js";
import parentRoutes       from "./routes/parent.routes.js";
import competencyRoutes   from "./routes/competency.routes.js";
import learnerProfileRoutes from "./routes/learnerProfile.routes.js";
import exportRoutes       from "./routes/export.routes.js";
import learningAreaRoutes from "./routes/learningArea.routes.js";
import feeRoutes          from "./routes/fee.routes.js";
import messageRoutes      from "./routes/message.routes.js";
import settingsRoutes       from "./routes/settings.routes.js";
import skillAssessmentRoutes from "./routes/skillAssessment.routes.js";
import importRoutes         from "./routes/import.routes.js";
import analyticsRoutes      from "./routes/analytics.routes.js";
import academicRoutes       from "./routes/academic.routes.js";
import timetableRoutes      from "./routes/timetable.routes.js";
import transportRoutes      from "./routes/transport.routes.js";
import disciplineRoutes     from "./routes/discipline.routes.js";
import libraryRoutes        from "./routes/library.routes.js";
import tpadRoutes           from "./routes/tpad.routes.js";
import examRoutes           from "./routes/exam.routes.js";
import nemisRoutes          from "./routes/nemis.routes.js";
import schoolRoutes         from "./routes/school.routes.js";
import logger               from "./utils/logger.js";
import { sanitizeBody }     from "./middleware/sanitize.middleware.js";

const app = express();

// Security headers
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

// CORS — restrict to allowed origins
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map(o => o.trim())
  : ["http://localhost:3000", "http://localhost:5173"];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

// Body parsing + sanitization
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(sanitizeBody);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Request logging
app.use((req, _res, next) => {
  logger.info({ method: req.method, url: req.url, ip: req.ip });
  next();
});

// Rate limiting
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: "Too many login attempts. Please try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  message: { success: false, message: "Too many requests. Please slow down." },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/auth/login", loginLimiter);
app.use("/api", apiLimiter);

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString(), uptime: process.uptime() });
});

// Routes
app.use("/api/students",       studentRoutes);
app.use("/api/classes",        classRoutes);
app.use("/api/teachers",       teacherRoutes);
app.use("/api/users",          userRoutes);
app.use("/api/auth",           authRoutes);
app.use("/api/assessments",    assessmentRoutes);
app.use("/api/report-cards",   reportCardRoutes);
app.use("/api/attendance",     attendanceRoutes);
app.use("/api/assignments",    assignmentRoutes);
app.use("/api/parents",        parentRoutes);
app.use("/api/competencies",   competencyRoutes);
app.use("/api/learner-profiles", learnerProfileRoutes);
app.use("/api/export",         exportRoutes);
app.use("/api/learning-areas", learningAreaRoutes);
app.use("/api/fees",           feeRoutes);
app.use("/api/messages",       messageRoutes);
app.use("/api/settings",         settingsRoutes);
app.use("/api/skill-assessments", skillAssessmentRoutes);
app.use("/api/import",           importRoutes);
app.use("/api/analytics",        analyticsRoutes);
app.use("/api/academic",         academicRoutes);
app.use("/api/timetable",        timetableRoutes);
app.use("/api/transport",        transportRoutes);
app.use("/api/discipline",       disciplineRoutes);
app.use("/api/library",          libraryRoutes);
app.use("/api/tpad",             tpadRoutes);
app.use("/api/exams",            examRoutes);
app.use("/api/nemis",            nemisRoutes);
app.use("/api/schools",          schoolRoutes);

// Global error handler
app.use((err, req, res, _next) => {
  const status = err.status ?? 500;
  logger.error({ message: err.message, stack: err.stack, url: req.url, status });

  // Never send raw error internals to the client in production
  const isClientError = status >= 400 && status < 500;
  const message = isClientError
    ? (err.message ?? "Bad request")
    : process.env.NODE_ENV === "production"
      ? "Internal server error"
      : (err.message ?? "Internal server error");

  res.status(status).json({ success: false, message });
});

export default app;
