import { config as configDotEnv } from "dotenv";

import Client from "./structures/Client";

console.clear();

configDotEnv();
const client: Client = new Client(true);

client
	.registerCommands(true)
	.then(() => console.log("Done!"))
	.catch((error) => console.error(error));
