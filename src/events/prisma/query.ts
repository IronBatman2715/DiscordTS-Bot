import { PrismaEvent } from "../../structures/Event";
import logger from "../../logger";

export = new PrismaEvent("query", async ({ query }) => {
  logger.verbose("Prisma query", { query });
});
