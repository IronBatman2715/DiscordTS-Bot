import { SlashCommandBuilder } from "discord.js";
import { useQueue } from "discord-player";

import logger from "../../logger.js";
import Command from "../../structures/Command.js";
import type QueueMetadata from "../../structures/QueueMetadata.js";

export default new Command(
  new SlashCommandBuilder().setName("resume").setDescription("Resume paused music."),

  async (_client, interaction) => {
    const queue = useQueue<QueueMetadata>(interaction.guildId);
    if (!queue) return;

    if (!queue.node.isPaused()) {
      logger.info("Queue is not paused right now.");
    } else {
      queue.node.setPaused(false);
      logger.info("Resumed the music queue!");
    }

    await interaction.deleteReply();
  }
);
