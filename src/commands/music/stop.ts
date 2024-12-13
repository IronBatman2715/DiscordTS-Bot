import { SlashCommandBuilder } from "discord.js";

import getQueue from "../../functions/music/getQueue.js";
import Command from "../../structures/Command.js";

export default new Command(
  new SlashCommandBuilder().setName("stop").setDescription("Stops playing music."),

  async (_client, interaction) => {
    const guildQueue = await getQueue(interaction);
    if (!guildQueue) return;

    guildQueue.delete();
    await interaction.followUp({
      content: "Stopped the music queue!",
    });
  }
);
