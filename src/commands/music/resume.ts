import { SlashCommandBuilder } from "@discordjs/builders";

import Command from "../../structures/Command";
import getGuildQueue from "../../functions/music/getGuildQueue";
import tempMessage from "../../functions/discord/tempMessage";

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
      await tempMessage(interaction, "Queue is not paused right now.");
    } else {
      guildQueue.setPaused(false);
      await interaction.deleteReply();
    }
  }
);
