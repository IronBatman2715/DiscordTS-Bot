import { SlashCommandBuilder } from "@discordjs/builders";

import Command from "../../structures/Command";
import getGuildQueue from "../../functions/music/getGuildQueue";

export = new Command(
  new SlashCommandBuilder().setName("stop").setDescription("Stops playing music."),

  async (client, interaction) => {
    const guildQueue = await getGuildQueue(client, interaction);
    if (typeof guildQueue === "undefined") {
      return interaction.followUp({
        content: "Cannot stop a queue has not been started!",
      });
    }

    guildQueue.stop();

    await interaction.deleteReply();
  }
);
