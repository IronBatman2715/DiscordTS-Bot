import { PrismaEvent } from "../../structures/Event";

export = new PrismaEvent("warn", async (client, { message, timestamp }) => {
  console.log(timestamp, "Prisma warning: ", message);
});
