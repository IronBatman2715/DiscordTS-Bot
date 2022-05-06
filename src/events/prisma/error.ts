import { PrismaEvent } from "../../structures/Event";
import logger from "../../logger";

export = new PrismaEvent("error", async (client, { message }) => {
  logger.error(`Prisma error: ${message}`);
});
