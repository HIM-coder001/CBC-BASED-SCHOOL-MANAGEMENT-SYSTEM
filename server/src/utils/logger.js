import { createLogger, format, transports } from "winston";
import { existsSync, mkdirSync } from "fs";

// Ensure logs directory exists
if (!existsSync("logs")) mkdirSync("logs");

const logger = createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.errors({ stack: true }),
    format.json()
  ),
  transports: [
    // Console — human-readable in dev, JSON in prod
    new transports.Console({
      format: process.env.NODE_ENV === "production"
        ? format.json()
        : format.combine(format.colorize(), format.simple()),
    }),
    // File — always JSON
    new transports.File({ filename: "logs/error.log",  level: "error" }),
    new transports.File({ filename: "logs/combined.log" }),
  ],
});

export default logger;
