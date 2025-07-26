import { SlashCommandBuilder } from "discord.js";
import { useQueue } from "discord-player";

import logger from "../../logger.js";
import Command from "../../structures/Command.js";
import type QueueMetadata from "../../structures/QueueMetadata.js";

export default new Command(
  new SlashCommandBuilder().setName("pause").setDescription("Pause music."),

  async (_client, interaction) => {
    const queue = useQueue<QueueMetadata>(interaction.guildId);
    if (!queue) return;

    if (queue.node.isPaused()) {
      logger.info("Queue is already paused right now.");
    } else {
      queue.node.setPaused(true);
      logger.info("Paused the music queue!");
    }

    await interaction.deleteReply();
  }
);
