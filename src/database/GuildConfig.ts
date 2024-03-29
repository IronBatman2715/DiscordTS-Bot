import type { GuildConfig } from "@prisma/client";
import { QueueRepeatMode } from "discord-player";

export const guildConfigDefaults: Omit<GuildConfig, "guildId" | "id"> = {
  greetings: [
    "Hello!",
    "Hello there!",
    "How are you!",
    "Howdy!",
    "What's up chief?",
    "Greetings",
    "What's cracka-lackin?!",
    "Sup bro",
    "What's up boss?",
    "Ah, hello human",
  ],
  maxMessagesCleared: 100,
  musicChannelId: "",
  defaultRepeatMode: QueueRepeatMode.OFF,
};

export const guildConfigDescriptions: Record<string, string> = {
  greetings: "List of greetings that the bot can send.",
  maxMessagesCleared: "Maximum number of messages `/clear` can delete in one command call.",
  musicChannelId: "If specified, ALL music commands MUST be entered in this text channel!",
  defaultRepeatMode: "Default repeat mode of music player.",
};

export default { defaults: guildConfigDefaults, descriptions: guildConfigDescriptions };
