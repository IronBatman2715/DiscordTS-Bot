import { SlashCommandBuilder } from "discord.js";
import { QueueRepeatMode, useQueue } from "discord-player";

import { isQueueRepeatMode, toDisplayString } from "../../functions/music/queueRepeatMode.js";
import logger from "../../logger.js";
import Command from "../../structures/Command.js";
import type QueueMetadata from "../../structures/QueueMetadata.js";

export default new Command(
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

  async (_client, interaction) => {
    const queue = useQueue<QueueMetadata>(interaction.guildId);
    if (!queue) return;

    const repeatMode = interaction.options.getInteger("option", true);
    if (!isQueueRepeatMode(repeatMode)) {
      throw new TypeError(`Invalid QueueRepeatMode value: "${repeatMode}"`);
    }

    const repeatModeDisplay = toDisplayString(repeatMode);

    // Change the repeat behavior of the queue
    if (queue.repeatMode === repeatMode) {
      logger.info(`Already set to that repeat mode (${repeatModeDisplay})!`);
    } else {
      queue.setRepeatMode(repeatMode);
      logger.info(`Set music queue repeat mode to: ${repeatModeDisplay}!`);
    }

    await interaction.deleteReply();
  }
);
