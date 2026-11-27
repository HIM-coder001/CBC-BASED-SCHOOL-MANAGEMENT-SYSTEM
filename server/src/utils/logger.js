import { createLogger, format, transports } from "winston";
import { existsSync, mkdirSync } from "fs";

if (!existsSync("logs")) mkdirSync("logs");

// Human-readable format for development: timestamp + level + message + any extra fields
const devFormat = format.combine(
  format.colorize(),
  format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  format.printf(({ timestamp, level, message, ...meta }) => {
    // When logging an object (e.g. logger.info({ method, url })), promote fields to message
    const msg = message ?? JSON.stringify(meta);
    const extra = message && Object.keys(meta).length
      ? " " + JSON.stringify(meta)
      : "";
    return `${timestamp} ${level}: ${msg}${extra}`;
  })
);

const prodFormat = format.combine(
  format.timestamp(),
  format.errors({ stack: true }),
  format.json()
);

const logger = createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: prodFormat,
  transports: [
    new transports.Console({
      format: process.env.NODE_ENV === "production" ? prodFormat : devFormat,
    }),
    new transports.File({ filename: "logs/error.log",   level: "error" }),
    new transports.File({ filename: "logs/combined.log" }),
  ],
});

export default logger;
