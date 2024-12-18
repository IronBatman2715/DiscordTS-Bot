import Client from "./structures/Client.js";

const client = await Client.get();
await client.start();
