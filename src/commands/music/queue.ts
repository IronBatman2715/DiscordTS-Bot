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

    await client.sendMultiPageEmbed(interaction, queueFieldArr, {
      otherEmbedData: {
        title: `Music Queue [Repeat mode: ${RepeatMode[guildQueue.repeatMode]}]`,
        thumbnail: {
          url: "attachment://music.png",
        },
      },
      otherReplyOptions: { files: ["assets/icons/music.png"] },
    });
  }
);
