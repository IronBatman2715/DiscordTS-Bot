import { SlashCommandBuilder } from "discord.js";

import Command from "../../structures/Command";
import getQueue from "../../functions/music/getQueue";

export = new Command(
  new SlashCommandBuilder().setName("stop").setDescription("Stops playing music."),

  async (client, interaction) => {
    const guildQueue = await getQueue(interaction);
    if (!guildQueue) return;

    guildQueue.delete();
    await interaction.followUp({
      content: "Stopped the music queue!",
    });
  }
);
