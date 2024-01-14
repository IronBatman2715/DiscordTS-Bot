import { config } from "dotenv";
import type { Logger } from "winston";
import { createLogger, format, transports } from "winston";

import { defaultBotConfig, getConfigFile } from "./botConfig";

const { timestamp, combine, printf, errors, colorize, json } = format;

/* The following top-level code will execute BEFORE anything else */

const version = process.env.npm_package_version;

let logger: Logger;
if (process.env.NODE_ENV === "development") {
  // Load "development.env"
  config({ path: "development.env" });

  // Initialize development logger
  logger = createLogger({
    defaultMeta: { service: `${defaultBotConfig.name}@${version}-dev` },
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
  // Load ".env"
  config({ path: ".env" });

  // Initialize production logger
  const { name } = getConfigFile();
  logger = createLogger({
    defaultMeta: { service: `${name}@${version}` },
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
