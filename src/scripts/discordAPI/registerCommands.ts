import { isDevEnvironment } from "../../functions/general/environment.js";
import logger from "../../logger.js";
import Client, { DiscordAPIAction } from "../../structures/Client.js";

if (isDevEnvironment()) throw new Error("Must register global commands in production environment!");

const client = await Client.get();
await client.manageDiscordAPICommands(DiscordAPIAction.Register);

logger.info("Exiting script");
await client.destroy();
