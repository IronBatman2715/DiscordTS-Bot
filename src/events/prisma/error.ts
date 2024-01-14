import logger from "../../logger";
import { PrismaEvent } from "../../structures/Event";

export = new PrismaEvent("error", async ({ message }) => {
  logger.error(new Error(`Prisma error: ${message}`));
});
