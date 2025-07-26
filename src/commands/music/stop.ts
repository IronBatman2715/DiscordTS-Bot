import { SlashCommandBuilder } from "discord.js";
import { useQueue } from "discord-player";

import Command from "../../structures/Command.js";
import type QueueMetadata from "../../structures/QueueMetadata.js";

export default new Command(
  new SlashCommandBuilder().setName("stop").setDescription("Stops playing music."),

  async (_client, interaction) => {
    const queue = useQueue<QueueMetadata>(interaction.guildId);
    if (!queue) return;

    queue.delete();

    await interaction.deleteReply();
  }
);
