import { config as configDotEnv } from "dotenv";

import Client from "./structures/Client";
import logger from "./logger";

configDotEnv();
const client: Client = new Client();

let exitCode = 1;

client
  .registerCommands(true)
  .then(() => {
    logger.info("Successfully registered global commands!");
    exitCode = 0;
  })
  .catch((error) => {
    logger.error(error);
    logger.info("FAILED to register global commands!");
  })
  .finally(() => {
    logger.info("Closing process in 3 seconds...");
    setTimeout(process.exit(exitCode), 3000);
  });
