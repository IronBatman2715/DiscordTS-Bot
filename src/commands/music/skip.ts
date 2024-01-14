import { SlashCommandBuilder } from "discord.js";

import getQueue from "../../functions/music/getQueue";
import Command from "../../structures/Command";

export = new Command(
  new SlashCommandBuilder().setName("skip").setDescription("Skip the current track."),
  async (client, interaction) => {
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
