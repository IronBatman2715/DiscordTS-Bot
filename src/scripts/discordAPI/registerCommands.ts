import { isDevEnvironment } from "../../functions/general/environment";
import Client, { DiscordAPIAction } from "../../structures/Client";

if (isDevEnvironment()) throw new Error("Must register global commands in production environment!");

Client.get().manageDiscordAPICommands(DiscordAPIAction.Register);
