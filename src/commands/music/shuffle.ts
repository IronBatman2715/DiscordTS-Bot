import { SlashCommandBuilder } from "discord.js";
import { useQueue } from "discord-player";

import logger from "../../logger.js";
import Command from "../../structures/Command.js";
import type QueueMetadata from "../../structures/QueueMetadata.js";

export default new Command(
  new SlashCommandBuilder().setName("shuffle").setDescription("Shuffles the tracks currently in the music queue."),
  async (_client, interaction) => {
    const queue = useQueue<QueueMetadata>(interaction.guildId);
    if (!queue) return;

    if (queue.tracks.toArray().length > 1) {
      queue.tracks.shuffle();
      logger.info("Shuffled the music queue!");
    } else {
      logger.warn("The queue has only one song in it! Use `/play` to queue more songs.");
    }

    await interaction.deleteReply();
  }
);
