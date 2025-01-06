import logger from "../../logger.js";
import { PrismaEvent } from "../../structures/Event.js";

export default new PrismaEvent("query", ({ query }) => {
  logger.verbose("Prisma query", { query });
});
