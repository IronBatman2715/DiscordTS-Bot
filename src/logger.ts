import { createLogger, format, transports } from "winston";

import { defaultBotConfig, getConfigFile } from "./botConfig.js";
import { isDevEnvironment } from "./functions/general/environment.js";

const { timestamp, combine, printf, errors, colorize, json } = format;

/* The following top-level code will execute BEFORE anything else */

const version = process.env.npm_package_version;

function initLogger() {
  if (isDevEnvironment()) {
    // Initialize development logger
    const { name } = defaultBotConfig;
    return createLogger({
      defaultMeta: { service: `${name}@${version}` },
      format: combine(errors({ stack: true }), timestamp({ format: "HH:mm:ss:SS" })),
      level: "debug",
      transports: [
        new transports.Console({
          format: combine(
            colorize(),
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
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
    // Initialize production logger
    const { name } = getConfigFile();
    return createLogger({
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
}

const logger = initLogger();
export default logger;
