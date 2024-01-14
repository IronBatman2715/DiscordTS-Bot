import logger from "../../logger";
import { PrismaEvent } from "../../structures/Event";

export = new PrismaEvent("info", async ({ message }) => {
  logger.info(`Prisma info: ${message}`);
});
