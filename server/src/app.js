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
  logger.info(`${req.method} ${req.url}`, { ip: req.ip });
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

app.use("/api/auth/login",    loginLimiter);
app.use("/api/v1/auth/login", loginLimiter);
app.use("/api",    apiLimiter);
app.use("/api/v1", apiLimiter);

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString(), uptime: process.uptime() });
});

// Routes — mounted under /api/v1  (legacy /api prefix still works via alias below)
const v1 = express.Router();

v1.use("/students",         studentRoutes);
v1.use("/classes",          classRoutes);
v1.use("/teachers",         teacherRoutes);
v1.use("/users",            userRoutes);
v1.use("/auth",             authRoutes);
v1.use("/assessments",      assessmentRoutes);
v1.use("/report-cards",     reportCardRoutes);
v1.use("/attendance",       attendanceRoutes);
v1.use("/assignments",      assignmentRoutes);
v1.use("/parents",          parentRoutes);
v1.use("/competencies",     competencyRoutes);
v1.use("/learner-profiles", learnerProfileRoutes);
v1.use("/export",           exportRoutes);
v1.use("/learning-areas",   learningAreaRoutes);
v1.use("/fees",             feeRoutes);
v1.use("/messages",         messageRoutes);
v1.use("/settings",         settingsRoutes);
v1.use("/skill-assessments",skillAssessmentRoutes);
v1.use("/import",           importRoutes);
v1.use("/analytics",        analyticsRoutes);
v1.use("/academic",         academicRoutes);
v1.use("/timetable",        timetableRoutes);
v1.use("/transport",        transportRoutes);
v1.use("/discipline",       disciplineRoutes);
v1.use("/library",          libraryRoutes);
v1.use("/tpad",             tpadRoutes);
v1.use("/exams",            examRoutes);
v1.use("/nemis",            nemisRoutes);
v1.use("/schools",          schoolRoutes);

app.use("/api/v1", v1);
app.use("/api",    v1); // backward-compatible alias

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
