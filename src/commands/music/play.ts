import { GuildMember, SlashCommandBuilder } from "discord.js";

import getQueue from "../../functions/music/getQueue.js";
import { isQueueRepeatMode } from "../../functions/music/queueRepeatMode.js";
import Command from "../../structures/Command.js";
import logger from "../../structures/Logger.js";
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
  async (client, interaction) => {
    if (!(interaction.member instanceof GuildMember))
      throw new TypeError("Expected `interaction.member` to be of type `GuildMember`");

    // Check if user is currently in a voice channel
    if (!interaction.member.voice.channel) {
      await interaction.followUp({
        content: "Join a voice channel first!",
      });
      return;
    }

    const query = interaction.options.getString("query", true);

    const searchResult = await client.player.search(query, {
      requestedBy: interaction.user,
    });

    if (searchResult.isEmpty()) {
      await interaction.followUp({
        content: "Could not get a definitive link from your query! Try adding more details.",
      });
      return;
    }

    const guildQueue = await getQueue(interaction, true);
    if (!guildQueue) {
      logger.info("Player is creating a new GuildQueue");

      const { queue } = await client.player.play(interaction.member.voice.channel, searchResult, {
        nodeOptions: {
          metadata: new QueueMetadata(client, interaction),
          selfDeaf: true,
        },
        requestedBy: interaction.user,
      });

      const { defaultRepeatMode } = await client.DB.getGuildConfig(interaction.guildId);
      if (!isQueueRepeatMode(defaultRepeatMode)) {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        throw new TypeError(`Invalid default QueueRepeatMode value in database: "${defaultRepeatMode}"`);
      }

      if (queue.repeatMode !== defaultRepeatMode) queue.setRepeatMode(defaultRepeatMode);
    } else {
      logger.info("Player is using pre-existing GuildQueue");

      await client.player.play(interaction.member.voice.channel, searchResult, {
        requestedBy: interaction.user,
      });
    }
  }
);
