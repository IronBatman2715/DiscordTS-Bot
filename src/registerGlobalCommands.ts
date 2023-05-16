import Client from "./structures/Client";

if (process.env.NODE_ENV === "development") throw new Error("Must register global commands in production environment!");

const client = new Client();

client.registerCommands();
