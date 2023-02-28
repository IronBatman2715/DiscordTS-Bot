import { SlashCommandBuilder } from "discord.js";

import Command from "../../structures/Command";
import getGuildQueue from "../../functions/music/getGuildQueue";

export = new Command(
  new SlashCommandBuilder().setName("resume").setDescription("Resume paused music."),

  async (client, interaction) => {
    const guildQueue = await getGuildQueue(client, interaction);
    if (typeof guildQueue === "undefined") {
      return await interaction.followUp({
        content: "No active music queue to resume!",
      });
    }

    if (!guildQueue.paused) {
      await interaction.followUp({
        content: "Queue is not paused right now.",
      });
    } else {
      guildQueue.setPaused(false);
      await interaction.followUp({
        content: "Resumed the music queue!",
      });
    }
  }
);
