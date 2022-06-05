import { SlashCommandBuilder } from "@discordjs/builders";
import { RepeatMode } from "discord-music-player";

import Command from "../../structures/Command";
import getGuildQueue from "../../functions/music/getGuildQueue";

export = new Command(
  new SlashCommandBuilder()
    .setName("repeat")
    .setDescription("Set the repeat mode of the music queue.")
    .addIntegerOption((option) =>
      option
        .setName("option")
        .setDescription("Repeat mode to use.")
        .setRequired(true)
        .addChoices(
          { name: "disable", value: RepeatMode.DISABLED },
          { name: "song", value: RepeatMode.SONG },
          { name: "queue", value: RepeatMode.QUEUE }
        )
    ),

  async (client, interaction) => {
    // Get queue
    const guildQueue = await getGuildQueue(client, interaction);
    if (typeof guildQueue === "undefined") {
      return await interaction.followUp({
        content: "No active music queue!",
      });
    }

    const repeatMode = interaction.options.getInteger("option", true);
    const repeatModeStr = RepeatMode[repeatMode].toLowerCase();

    // Change the repeat behavior of the queue
    if (guildQueue.repeatMode === repeatMode) {
      await interaction.followUp({
        content: `Already set to that repeat mode (${repeatModeStr})!`,
      });
    } else {
      guildQueue.setRepeatMode(repeatMode);
      await interaction.followUp({
        content: `Set music queue repeat mode to: ${repeatModeStr}!`,
      });
    }
  }
);
