import { PrismaEvent } from "../../structures/Event.js";
import logger from "../../structures/Logger.js";

export default new PrismaEvent("query", ({ query }) => {
  logger.verbose("Prisma query", { query });
});
