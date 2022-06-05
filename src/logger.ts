import { format, createLogger, transports } from "winston";
import type { Logger } from "winston";

import botConfig from "./botConfig";

const { timestamp, combine, printf, errors, colorize, json } = format;

let logger: Logger;
if (process.env.NODE_ENV === "development") {
  // Development logger

  logger = createLogger({
    defaultMeta: { service: `${botConfig.name}@${botConfig.version}` },
    format: combine(errors({ stack: true }), timestamp({ format: "HH:mm:ss:SS" })),
    level: "debug",
    transports: [
      new transports.Console({
        format: combine(
          colorize(),
          printf(({ level, message, timestamp, stack }) => `[${timestamp}] ${level}: ${stack || message}`)
        ),
      }),
      new transports.File({
        filename: "logs/complete-dev.log",
        format: json(),
      }),
    ],
  });
} else {
  // Production logger

  logger = createLogger({
    defaultMeta: { service: `${botConfig.name}@${botConfig.version}` },
    format: combine(timestamp(), errors({ stack: true }), json()),
    level: "debug",
    transports: [
      new transports.Console(),
      new transports.File({ filename: "logs/error.log", level: "error" }),
      new transports.File({ filename: "logs/warn.log", level: "warn" }),
      new transports.File({ filename: "logs/info.log", level: "info" }),
      new transports.File({ filename: "logs/complete.log" }),
    ],
  });
}

export default logger;
