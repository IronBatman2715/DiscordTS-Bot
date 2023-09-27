import { SlashCommandBuilder } from "discord.js";
import { QueueRepeatMode } from "discord-player";

import Command from "../../structures/Command";
import getQueue from "../../functions/music/getQueue";

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
          { name: "off", value: QueueRepeatMode.OFF },
          { name: "track", value: QueueRepeatMode.TRACK },
          { name: "queue", value: QueueRepeatMode.QUEUE },
          { name: "autoplay", value: QueueRepeatMode.AUTOPLAY }
        )
    ),

  async (client, interaction) => {
    const guildQueue = await getQueue(interaction);
    if (!guildQueue) return;

    const repeatMode = interaction.options.getInteger("option", true);
    const repeatModeStr = QueueRepeatMode[repeatMode].toLowerCase();

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
