import { SlashCommandBuilder } from "@discordjs/builders";

import Command from "../../structures/Command";
import getGuildQueue from "../../functions/music/getGuildQueue";

export = new Command(
  new SlashCommandBuilder().setName("shuffle").setDescription("Shuffles the songs currently in the music queue."),
  async (client, interaction) => {
    // Get queue
    const guildQueue = await getGuildQueue(client, interaction);
    if (typeof guildQueue === "undefined") {
      return await interaction.followUp({
        content: "No active music queue to shuffle!",
      });
    }

    guildQueue.shuffle();
    await interaction.followUp({
      content: "Shuffled the music queue!",
    });
  }
);
