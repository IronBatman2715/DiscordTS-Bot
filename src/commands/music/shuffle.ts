import { SlashCommandBuilder } from "discord.js";

import getQueue from "../../functions/music/getQueue";
import Command from "../../structures/Command";

export = new Command(
  new SlashCommandBuilder().setName("shuffle").setDescription("Shuffles the tracks currently in the music queue."),
  async (client, interaction) => {
    const guildQueue = await getQueue(interaction);
    if (!guildQueue) return;

    if (guildQueue.tracks.toArray().length > 1) {
      guildQueue.tracks.shuffle();
      await interaction.followUp({
        content: "Shuffled the music queue!",
      });
    } else {
      await interaction.followUp({
        content: "The queue has only one song in it! Use `/play` to queue more songs.",
      });
    }
  }
);
