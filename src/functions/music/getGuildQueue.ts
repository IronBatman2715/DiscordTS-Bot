import type { CacheType, CommandInteraction } from "discord.js";

import assertQueueData from "./assertQueueData";
import type Client from "../../structures/Client";
import QueueData from "../../structures/QueueData";
import logger from "../../logger";

/**
 * @param updateLatestInteraction Set to true to override `queue.data.latestInteraction` with `interaction`
 */
export default async (client: Client, interaction: CommandInteraction<CacheType>, updateLatestInteraction = false) => {
  const guildId = interaction.guildId;
  if (typeof guildId !== "string") return;

  // If this server has a music queue already, get it. If not, create with new QueueData
  if (client.player.hasQueue(guildId)) {
    logger.verbose("Queue already exists!");
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const guildQueue = client.player.getQueue(guildId)!;
    assertQueueData(guildQueue);

    if (updateLatestInteraction) guildQueue.data.latestInteraction = interaction;

    return guildQueue;
  } else {
    logger.verbose("Queue does not exist!");

    // Create new queue ONLY if input interaction is set to be the latest interaction
    if (updateLatestInteraction) {
      logger.verbose("Making a new queue now!");

      const guildQueue = client.player.createQueue(guildId, {
        data: new QueueData(client, interaction),
      });
      assertQueueData(guildQueue);

      const { defaultRepeatMode } = await client.DB.getGuildConfig(guildId);
      guildQueue.setRepeatMode(defaultRepeatMode);

      return guildQueue;
    } else {
      await interaction.followUp({
        content: "A queue has not been started yet! Use `/play` or `/playlist` to queue a song.",
      });
    }
  }
};
