import { PrismaEvent } from "../../structures/Event";
import logger from "../../structures/Logger";

export = new PrismaEvent("query", async ({ query }) => {
  logger.verbose("Prisma query", { query });
});
