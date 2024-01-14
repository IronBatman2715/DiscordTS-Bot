import { useQueue } from "discord-player";
import type { CacheType, ChatInputCommandInteraction } from "discord.js";

import logger from "../../structures/Logger";
import type QueueData from "../../structures/QueueData";

/** Get Discord Player queue for corresponding guildId (if exists) */
export default async (interaction: ChatInputCommandInteraction<CacheType>, updateLatestInteraction = false) => {
  if (!interaction.guildId) throw new ReferenceError("Could not retrieve guildId from interaction");

  const guildQueue = useQueue<QueueData>(interaction.guildId);
  if (!guildQueue) {
    logger.verbose("Queue does not exist!");

    if (!updateLatestInteraction)
      await interaction.followUp({
        content: "A queue has not been started yet! Use `/play` to queue a song.",
      });

    return null;
  }

  logger.verbose("Queue already exists!");
  if (updateLatestInteraction) guildQueue.metadata.latestInteraction = interaction;

  return guildQueue;
};
