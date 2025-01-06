import logger from "../../logger.js";
import { PrismaEvent } from "../../structures/Event.js";

export default new PrismaEvent("error", ({ message }) => {
  logger.error(new Error(`Prisma error: ${message}`));
});
