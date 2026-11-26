import dotenv from "dotenv";
dotenv.config();

// Fail fast if critical env vars are missing
const REQUIRED_ENV = ["JWT_SECRET", "DATABASE_URL"];
const missing = REQUIRED_ENV.filter(k => !process.env[k]);
if (missing.length > 0) {
  console.error(`[FATAL] Missing env vars: ${missing.join(", ")}`);
  process.exit(1);
}

import app from "./app.js";
import logger from "./utils/logger.js";
import { startFeeReminderJob } from "./utils/feeReminder.js";
import prisma from "../prisma/client.js";

const PORT = process.env.PORT || 5000;

app.get("/", (_req, res) => {
  res.json({ message: "SchoolHub CBC Management API", version: "1.0.0" });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  logger.info(
    `Server running on port ${PORT} [${process.env.NODE_ENV ?? "development"}]`
  );

  startFeeReminderJob();
});

// Graceful shutdown
const shutdown = async (signal) => {
  logger.info(`${signal} — shutting down`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT",  () => shutdown("SIGINT"));
process.on("unhandledRejection", (reason) => logger.error({ msg: "Unhandled rejection", reason }));
process.on("uncaughtException",  (err)    => { logger.error({ msg: "Uncaught exception", err }); process.exit(1); });
