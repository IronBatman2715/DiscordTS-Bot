import { SlashCommandBuilder } from "discord.js";
import { useQueue } from "discord-player";

import logger from "../../logger.js";
import Command from "../../structures/Command.js";
import type QueueMetadata from "../../structures/QueueMetadata.js";

export default new Command(
  new SlashCommandBuilder().setName("skip").setDescription("Skip the current track."),
  async (_client, interaction) => {
    const queue = useQueue<QueueMetadata>(interaction.guildId);
    if (!queue) return;

    const skippedTrack = queue.currentTrack;
    if (!skippedTrack) throw new ReferenceError("Could not retrieve current track");

    if (queue.node.skip()) {
      logger.info(`Skipped '${skippedTrack.title}'.`);
    } else {
      logger.warn(`Could not skip track!`);
    }

    await interaction.deleteReply();
  }
);
