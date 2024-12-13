import { PrismaEvent } from "../../structures/Event.js";
import logger from "../../structures/Logger.js";

export default new PrismaEvent("error", ({ message }) => {
  logger.error(new Error(`Prisma error: ${message}`));
});
