import type { GuildConfig } from "@prisma/client";
import { QueueRepeatMode } from "discord-player";

import logger from "../logger.js";
import { prisma } from "./index.js";

export const defaults: Omit<GuildConfig, "guildId" | "id"> = {
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
export const descriptions: Record<string, string> = {
  greetings: "List of greetings that the bot can send.",
  maxMessagesCleared: "Maximum number of messages `/clear` can delete in one command call.",
  musicChannelId: "If specified, ALL music commands MUST be entered in this text channel!",
  defaultRepeatMode: "Default repeat mode of music player.",
};

/** Get the guild config data corresponding to guildId. If does not exist, generate based on defaults! */
export async function getGuildConfig(guildId: string) {
  logger.verbose("DB.getGuildConfig()", { guildId });

  const query = await prisma.guildConfig.findUnique({ where: { guildId } });

  if (query) return query;

  logger.verbose("DB.getGuildConfig(): Could not find match, creating a new one");
  return await prisma.guildConfig.create({
    data: {
      guildId,
      greetings: defaults.greetings,
      maxMessagesCleared: defaults.maxMessagesCleared,
      musicChannelId: defaults.musicChannelId,
      defaultRepeatMode: defaults.defaultRepeatMode,
    },
  });
}

/** Update the guild config document corresponding to guildId with the data in guildConfig. */
export async function updateGuildConfig(guildId: string, guildConfig: Partial<Omit<GuildConfig, "id" | "guildId">>) {
  logger.verbose("DB.updateGuildConfig()", { guildId, guildConfig });

  return await prisma.guildConfig.update({
    where: { guildId },
    data: guildConfig,
  });
}

/** Delete the guild config document corresponding to guildId. */
export async function deleteGuildConfig(guildId: string) {
  logger.verbose("DB.deleteGuildConfig()", { guildId });

  return await prisma.guildConfig.delete({ where: { guildId } });
}

export default { defaults, descriptions, getGuildConfig, updateGuildConfig, deleteGuildConfig };
