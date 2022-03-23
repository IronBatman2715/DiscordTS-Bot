import { MongooseEvent } from "../../structures/Event";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export = new MongooseEvent("error", async (client) => {
  console.error(`MongoDB Errored!`);
});
