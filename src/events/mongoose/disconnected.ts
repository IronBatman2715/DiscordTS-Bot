import { MongooseEvent } from "../../structures/Event";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export = new MongooseEvent("disconnected", async (client) => {
  console.log(`Disconnected from MongoDB!`);
});
