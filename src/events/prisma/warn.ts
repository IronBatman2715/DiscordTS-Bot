import logger from "../../logger.js";
import { PrismaEvent } from "../../structures/Event.js";

export default new PrismaEvent("warn", ({ message }) => {
  logger.warn(`Prisma warning: ${message}`);
});
