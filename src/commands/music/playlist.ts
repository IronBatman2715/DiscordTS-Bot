import type { GuildMember } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { Utils } from "discord-music-player";

import Command from "../../structures/Command";
import getGuildQueue from "../../functions/music/getGuildQueue";

export = new Command(
  new SlashCommandBuilder()
    .setName("playlist")
    .setDescription("Plays a playlist or adds it to the end of the music queue.")
    .addStringOption((option) =>
      option.setName("playlist-url").setDescription("A URL (youtube, spotify, or apple music).").setRequired(true)
    ),
  async (client, interaction) => {
    const voiceChannel = (interaction.member as GuildMember).voice.channel;

    //Check user is in a voice channel
    if (!voiceChannel) {
      return await interaction.followUp({
        content: "Join a voice channel first!",
      });
    }

    const playlistQuery = interaction.options.getString("playlist-url", true);

    //Check that user entered a URL as search queries are not supported
    if (
      !(
        Utils.regexList.YouTubePlaylist.test(playlistQuery) ||
        Utils.regexList.SpotifyPlaylist.test(playlistQuery) ||
        Utils.regexList.ApplePlaylist.test(playlistQuery)
      )
    ) {
      return await interaction.followUp({
        content: "Must enter a URL (youtube, spotify, or apple music) for playlists!",
      });
    }

    const guildQueue = await getGuildQueue(client, interaction, true);
    if (typeof guildQueue === "undefined") return;

    await guildQueue.join(voiceChannel);

    await guildQueue.playlist(playlistQuery, {
      shuffle: false,
      requestedBy: interaction.user,
    });
  }
);
