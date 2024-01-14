import logger from "../../logger";
import { PrismaEvent } from "../../structures/Event";

export = new PrismaEvent("warn", async ({ message }) => {
  logger.warn(`Prisma warning: ${message}`);
});
