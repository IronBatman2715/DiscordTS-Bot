import { SlashCommandBuilder } from "discord.js";

import Command from "../../structures/Command.js";
import QueueMetadata from "../../structures/QueueMetadata.js";

export default new Command(
  new SlashCommandBuilder()
    .setName("play")
    .setDescription("Plays track(s) or adds it to the end of the music queue.")
    .addStringOption((option) =>
      option
        .setName("query")
        .setDescription("A search query or URL (youtube, spotify, apple music, etc.).")
        .setRequired(true)
    ),
  async (_client, interaction) => {
    const query = interaction.options.getString("query", true);

    const createdNewQueue = await QueueMetadata.playQuery(interaction, query);

    if (!createdNewQueue) {
      await interaction.deleteReply();
    }
  }
);
