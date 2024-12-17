import { isDevEnvironment } from "../../functions/general/environment.js";
import Client, { DiscordAPIAction } from "../../structures/Client.js";
import logger from "../../structures/Logger.js";

if (isDevEnvironment()) throw new Error("Must register global commands in production environment!");

const client = await Client.get();
await client.manageDiscordAPICommands(DiscordAPIAction.Register);

logger.info("Exiting script");
process.exit(0);
