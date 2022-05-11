import { SlashCommandBuilder } from "@discordjs/builders";

import Command from "../../structures/Command";
import getGuildQueue from "../../functions/music/getGuildQueue";

export = new Command(
  new SlashCommandBuilder().setName("pause").setDescription("Pause music."),

  async (client, interaction) => {
    const guildQueue = await getGuildQueue(client, interaction);
    if (typeof guildQueue === "undefined") {
      return interaction.followUp({
        content: "No active music queue to pause!",
      });
    }

    guildQueue.setPaused(true);

    await interaction.deleteReply();
  }
);
