import { PrismaEvent } from "../../structures/Event";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export = new PrismaEvent("query", async (client, { query, timestamp }) => {
  //console.log(timestamp, "Prisma query: ", query);
});
