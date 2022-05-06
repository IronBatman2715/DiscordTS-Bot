import { format, createLogger, transports } from "winston";
import type { Logger } from "winston";

import botConfig from "./botConfig";

const { timestamp, combine, printf, errors, colorize, json } = format;

let logger: Logger;
if (process.env.NODE_ENV === "development") {
  //Development logger

  logger = createLogger({
    format: combine(
      colorize(),
      timestamp({ format: "HH:mm:ss:SS" }),
      errors({ stack: true }),
      printf(({ level, message, timestamp, stack }) => {
        return `[${timestamp}] ${level}: ${stack || message}`;
      })
    ),
    transports: [new transports.Console({ level: "debug" })],
  });
} else {
  //Production logger

  logger = createLogger({
    format: combine(timestamp(), errors({ stack: true }), json()),
    defaultMeta: { service: `${botConfig.name}@${botConfig.version}` },
    transports: [
      new transports.File({ filename: "logs/error.log", level: "error" }),
      new transports.File({ filename: "logs/warn.log", level: "warn" }),
      new transports.File({ filename: "logs/info.log", level: "info" }),
      new transports.File({ filename: "logs/complete.log", level: "debug" }),
    ],
  });
}

export default logger;
