import Client, { DiscordAPIAction } from "../../structures/Client.js";
import logger from "../../structures/Logger.js";

const client = await Client.get();
await client.manageDiscordAPICommands(DiscordAPIAction.Reset);

logger.info("Exiting script");
await client.destroy();
