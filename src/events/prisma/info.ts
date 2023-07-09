import { PrismaEvent } from "../../structures/Event";
import logger from "../../logger";

export = new PrismaEvent("info", async ({ message }) => {
  logger.info(`Prisma info: ${message}`);
});
