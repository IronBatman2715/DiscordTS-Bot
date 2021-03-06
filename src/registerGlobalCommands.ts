import Client from "./structures/Client";

import { config } from "dotenv";

/** Load the appropriate .env file (`development.env` or `production.env`) */
config({ path: process.env.NODE_ENV === "development" ? "development.env" : "production.env" });

const client: Client = new Client();

if (client.devMode) throw new Error("Must register global commands in production environment!");

client.registerCommands();
