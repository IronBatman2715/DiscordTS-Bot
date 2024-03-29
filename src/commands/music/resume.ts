import { SlashCommandBuilder } from "discord.js";

import getQueue from "../../functions/music/getQueue";
import Command from "../../structures/Command";

export = new Command(
  new SlashCommandBuilder().setName("resume").setDescription("Resume paused music."),

  async (client, interaction) => {
    const guildQueue = await getQueue(interaction);
    if (!guildQueue) return;

    if (!guildQueue.node.isPaused()) {
      await interaction.followUp({
        content: "Queue is not paused right now.",
      });
    } else {
      guildQueue.node.setPaused(false);
      await interaction.followUp({
        content: "Resumed the music queue!",
      });
    }
  }
);
