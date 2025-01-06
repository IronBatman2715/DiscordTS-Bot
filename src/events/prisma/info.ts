import logger from "../../logger.js";
import { PrismaEvent } from "../../structures/Event.js";

export default new PrismaEvent("info", ({ message }) => {
  logger.info(`Prisma info: ${message}`);
});
