import Client, { DiscordAPIAction } from "../../structures/Client.js";

await Client.get().manageDiscordAPICommands(DiscordAPIAction.Reset);
