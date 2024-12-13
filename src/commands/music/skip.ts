import { SlashCommandBuilder } from "discord.js";

import getQueue from "../../functions/music/getQueue.js";
import Command from "../../structures/Command.js";

export default new Command(
  new SlashCommandBuilder().setName("skip").setDescription("Skip the current track."),
  async (_client, interaction) => {
    const guildQueue = await getQueue(interaction);
    if (!guildQueue) return;

    const skippedTrack = guildQueue.currentTrack;
    if (!skippedTrack) throw new ReferenceError("Could not retrieve current track");

    if (guildQueue.node.skip()) {
      await interaction.followUp({
        content: `Skipped '${skippedTrack.title}'.`,
      });
    } else {
      await interaction.followUp({
        content: `Could not skip track!`,
      });
    }
  }
);
