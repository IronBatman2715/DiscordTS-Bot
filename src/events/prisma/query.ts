import logger from "../../logger";
import { PrismaEvent } from "../../structures/Event";

export = new PrismaEvent("query", async ({ query }) => {
  logger.verbose("Prisma query", { query });
});
