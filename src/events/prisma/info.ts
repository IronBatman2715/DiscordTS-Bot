import { PrismaEvent } from "../../structures/Event";
import logger from "../../structures/Logger";

export = new PrismaEvent("info", async ({ message }) => {
  logger.info(`Prisma info: ${message}`);
});
