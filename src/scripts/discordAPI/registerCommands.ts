import { isDevEnvironment } from "../../functions/general/environment.js";
import Client, { DiscordAPIAction } from "../../structures/Client.js";

if (isDevEnvironment()) throw new Error("Must register global commands in production environment!");

await Client.get().manageDiscordAPICommands(DiscordAPIAction.Register);
