import Client from "./structures/Client";

import { config } from "dotenv";

if (process.env.NODE_ENV === "development") throw new Error("Must register global commands in production environment!");

// Load production.env
config({ path: "production.env" });

const client = new Client();

client.registerCommands();
