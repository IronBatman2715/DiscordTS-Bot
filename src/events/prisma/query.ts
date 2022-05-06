import { PrismaEvent } from "../../structures/Event";
import logger from "../../logger";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export = new PrismaEvent("query", async (client, { query }) => {
  logger.verbose("Prisma query", { query });
});
