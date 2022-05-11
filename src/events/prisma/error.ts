import { PrismaEvent } from "../../structures/Event";
import logger from "../../logger";

export = new PrismaEvent("error", async (client, { message }) => {
  logger.error(new Error(`Prisma error: ${message}`));
});
