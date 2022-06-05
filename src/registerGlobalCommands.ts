import loadEnv from "./loadEnv";

import Client from "./structures/Client";

loadEnv();
const client: Client = new Client();

if (client.devMode) throw new Error("Must register global commands in production environment!");

client.registerCommands();
