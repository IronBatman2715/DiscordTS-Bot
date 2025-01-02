import type { EmbedField } from "discord.js";
import { SlashCommandBuilder } from "discord.js";

import getQueue from "../../functions/music/getQueue.js";
import { toDisplayString } from "../../functions/music/queueRepeatMode.js";
import Command from "../../structures/Command.js";

export default new Command(
  new SlashCommandBuilder().setName("queue").setDescription("Display music queue."),
  async (client, interaction) => {
    const guildQueue = await getQueue(interaction);
    if (!guildQueue) return;

    // Check if queue is empty
    if (!guildQueue.currentTrack && guildQueue.tracks.toArray().length === 0) {
      await interaction.followUp({ content: "No tracks in queue!" });
      return;
    }

    const embedFieldArr: EmbedField[] = [];
    if (guildQueue.currentTrack) {
      const track = guildQueue.currentTrack;

      embedFieldArr.unshift({
        name: `Playing now: ${track.title})`,
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        value: `by: ${track.author}\nurl: ${track.url}\nrequested by: ${track.requestedBy ?? "USER"}\n`,
        inline: false,
      });
    }

    embedFieldArr.push(
      ...guildQueue.tracks.toArray().map((track, i) => {
        /* eslint-disable @typescript-eslint/restrict-template-expressions */
        return {
          name: `${i + 1}: ${track.title}`,
          value: `by: ${track.author}\nurl: ${track.url}\nrequested by: ${track.requestedBy ?? "USER"}\n`,
          inline: false,
        };
        /* eslint-enable @typescript-eslint/restrict-template-expressions */
      })
    );

    await client.sendMultiPageEmbed(interaction, embedFieldArr, {
      otherEmbedData: {
        title: `Music Queue [Repeat mode: ${toDisplayString(guildQueue.repeatMode)}]`,
        thumbnail: {
          url: "attachment://music.png",
        },
      },
      otherReplyOptions: { files: ["assets/icons/music.png"] },
    });
  }
);
