import Client from "./structures/Client";

if (process.env.NODE_ENV === "development") throw new Error("Must register global commands in production environment!");

Client.get().registerCommands();
