import { config } from "dotenv";
import type { Logger as WinstonLogger } from "winston";
import { createLogger, format, transports } from "winston";

import { defaultBotConfig, getConfigFile } from "../botConfig";
import { isDevEnvironment } from "../functions/general/environment";

const { timestamp, combine, printf, errors, colorize, json } = format;

/* The following top-level code will execute BEFORE anything else */

const version = process.env.npm_package_version;

export class Logger {
  /** Singleton instance */
  private static instance: WinstonLogger;

  /** Get/Generate singleton instance */
  static get() {
    if (!Logger.instance) new this();
    return Logger.instance;
  }

  private constructor() {
    if (isDevEnvironment()) {
      // Load "development.env"
      config({ path: "development.env" });

      // Initialize development logger
      const { name } = defaultBotConfig;
      Logger.instance = createLogger({
        defaultMeta: { service: `${name}@${version}-dev` },
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
      Logger.instance = createLogger({
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
}

const logger = Logger.get();
export default logger;
