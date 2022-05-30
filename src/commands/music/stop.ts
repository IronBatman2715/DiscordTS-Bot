import { SlashCommandBuilder } from "@discordjs/builders";

import Command from "../../structures/Command";
import getGuildQueue from "../../functions/music/getGuildQueue";

export = new Command(
  new SlashCommandBuilder().setName("stop").setDescription("Stops playing music."),

  async (client, interaction) => {
    const guildQueue = await getGuildQueue(client, interaction);
    if (typeof guildQueue === "undefined") {
      return await interaction.followUp({
        content: "No active music queue to stop!",
      });
    }

    guildQueue.stop();

    await interaction.deleteReply();
  }
);
