import { PrismaEvent } from "../../structures/Event";

export = new PrismaEvent("info", async (client, { timestamp, message }) => {
  console.log(timestamp, "Prisma info: ", message);
});
