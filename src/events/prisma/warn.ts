import { PrismaEvent } from "../../structures/Event.js";
import logger from "../../structures/Logger.js";

export default new PrismaEvent("warn", ({ message }) => {
  logger.warn(`Prisma warning: ${message}`);
});
