import { PrismaEvent } from "../../structures/Event";
import logger from "../../logger";

export = new PrismaEvent("info", async (client, { message }) => {
  logger.info(`Prisma info: ${message}`);
});
