import type { EmbedFieldData } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { RepeatMode } from "discord-music-player";

import Command from "../../structures/Command";
import getGuildQueue from "../../functions/music/getGuildQueue";

export = new Command(
  new SlashCommandBuilder().setName("queue").setDescription("Display music queue."),
  async (client, interaction) => {
    //Get queue
    const guildQueue = await getGuildQueue(client, interaction);
    if (typeof guildQueue === "undefined") {
      return interaction.followUp({
        content: "No active music queue to show!",
      });
    }

    //Check if queue is empty
    if (guildQueue.songs.length === 0) {
      return interaction.followUp({ content: "No songs in queue!" });
    }

    const queueFieldArr: EmbedFieldData[] = guildQueue.songs.map((song, i) => {
      return {
        name: `${i + 1}: [${song.name}] (${song.url})`,
        value: `by: ${song.author}\nrequested by: ${song.requestedBy}\n`,
        inline: false,
      };
    });

    //25 embed fields is max allowed by discord
    const songQuantitySubStr = guildQueue.songs.length > 25 ? `25/${guildQueue.songs.length}` : guildQueue.songs.length;

    const queueEmbedTitle = `Music Queue (${songQuantitySubStr} song${
      guildQueue.songs.length === 1 ? "" : "s"
    }) [Repeat mode: ${RepeatMode[guildQueue.repeatMode]}]`;

    const queueEmbed = client.genEmbed({
      title: queueEmbedTitle,
      fields: queueFieldArr,
      thumbnail: {
        url: "attachment://music.png",
      },
    });

    return await interaction.followUp({
      embeds: [queueEmbed],
      files: ["assets/icons/music.png"],
    });
  }
);
