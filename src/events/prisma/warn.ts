import { PrismaEvent } from "../../structures/Event";
import logger from "../../logger";

export = new PrismaEvent("warn", async (client, { message }) => {
  logger.warn(`Prisma warning: ${message}`);
});
