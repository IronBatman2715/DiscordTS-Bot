import { QueueRepeatMode } from "discord-player";
import type { EmbedField } from "discord.js";
import { SlashCommandBuilder } from "discord.js";

import getQueue from "../../functions/music/getQueue";
import Command from "../../structures/Command";

export = new Command(
  new SlashCommandBuilder().setName("queue").setDescription("Display music queue."),
  async (client, interaction) => {
    const guildQueue = await getQueue(interaction);
    if (!guildQueue) return;

    // Check if queue is empty
    if (!guildQueue.currentTrack && guildQueue.tracks.toArray().length === 0) {
      return await interaction.followUp({ content: "No tracks in queue!" });
    }

    const embedFieldArr: EmbedField[] = [];
    if (guildQueue.currentTrack) {
      const track = guildQueue.currentTrack;

      embedFieldArr.unshift({
        name: `Playing now: ${track.title})`,
        value: `by: ${track.author}\nurl: ${track.url}\nrequested by: ${track.requestedBy}\n`,
        inline: false,
      });
    }

    embedFieldArr.push(
      ...guildQueue.tracks.toArray().map((track, i) => {
        return {
          name: `${i + 1}: ${track.title}`,
          value: `by: ${track.author}\nurl: ${track.url}\nrequested by: ${track.requestedBy}\n`,
          inline: false,
        };
      })
    );

    await client.sendMultiPageEmbed(interaction, embedFieldArr, {
      otherEmbedData: {
        title: `Music Queue [Repeat mode: ${QueueRepeatMode[guildQueue.repeatMode]}]`,
        thumbnail: {
          url: "attachment://music.png",
        },
      },
      otherReplyOptions: { files: ["assets/icons/music.png"] },
    });
  }
);
