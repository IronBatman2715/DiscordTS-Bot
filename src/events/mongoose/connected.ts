import { MongooseEvent } from "../../structures/Event";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export = new MongooseEvent("connected", async (client) => {
  console.log(`Connected to MongoDB!`);
});
