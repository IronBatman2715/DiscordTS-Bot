import { PrismaEvent } from "../../structures/Event.js";
import logger from "../../structures/Logger.js";

export default new PrismaEvent("info", ({ message }) => {
  logger.info(`Prisma info: ${message}`);
});
