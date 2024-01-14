import { PrismaEvent } from "../../structures/Event";
import logger from "../../structures/Logger";

export = new PrismaEvent("warn", async ({ message }) => {
  logger.warn(`Prisma warning: ${message}`);
});
