import { GuildMember, SlashCommandBuilder } from "discord.js";

import getQueue from "../../functions/music/getQueue";
import Command from "../../structures/Command";
import logger from "../../structures/Logger";
import QueueData from "../../structures/QueueData";

export = new Command(
  new SlashCommandBuilder()
    .setName("play")
    .setDescription("Plays track(s) or adds it to the end of the music queue.")
    .addStringOption((option) =>
      option
        .setName("query")
        .setDescription("A search query or URL (youtube, spotify, apple music, etc.).")
        .setRequired(true)
    ),
  async (client, interaction) => {
    if (!(interaction.member instanceof GuildMember))
      throw TypeError("Expected `interaction.member` to be of type `GuildMember`");

    // Check if user is currently in a voice channel
    if (!interaction.member.voice.channel) {
      return await interaction.followUp({
        content: "Join a voice channel first!",
      });
    }

    const query = interaction.options.getString("query", true);

    const searchResult = await client.player.search(query, {
      requestedBy: interaction.user,
    });

    if (searchResult.isEmpty()) {
      return await interaction.followUp({
        content: "Could not get a definitive link from your query! Try adding more details.",
      });
    }

    const guildQueue = await getQueue(interaction, true);
    if (!guildQueue) {
      logger.info("Player is creating a new GuildQueue");

      const { queue } = await client.player.play(interaction.member.voice.channel, searchResult, {
        nodeOptions: {
          metadata: new QueueData(client, interaction),
          selfDeaf: true,
        },
        requestedBy: interaction.user,
      });

      const { defaultRepeatMode } = await client.DB.getGuildConfig(interaction.guildId);
      if (queue.repeatMode !== defaultRepeatMode) queue.setRepeatMode(defaultRepeatMode);
    } else {
      logger.info("Player is using pre-existing GuildQueue");

      await client.player.play(interaction.member.voice.channel, searchResult, {
        requestedBy: interaction.user,
      });
    }
  }
);
