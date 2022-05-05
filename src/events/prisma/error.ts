import { PrismaEvent } from "../../structures/Event";

export = new PrismaEvent("error", async (client, { message, timestamp }) => {
  console.log(timestamp, "Prisma error: ", message);
});
