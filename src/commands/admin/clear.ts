import type { TextChannel } from "discord.js";
import { SlashCommandBuilder } from "discord.js";

import { getGuildConfig } from "../../database/GuildConfig.js";
import tempMessage from "../../functions/discord/tempMessage.js";
import { isInRange } from "../../functions/general/math.js";
import logger from "../../logger.js";
import Command from "../../structures/Command.js";

export default new Command(
  new SlashCommandBuilder()
    .setName("clear")
    .setDescription("ADMIN ONLY: Clear messages from the text channel! (Cannot clear older than 2 weeks)")
    .addIntegerOption((option) =>
      option.setName("quantity").setDescription("Number of messages to delete").setRequired(true).setMinValue(1)
    ),

  async (_client, interaction) => {
    const quantity = interaction.options.getInteger("quantity", true);

    const { maxMessagesCleared } = await getGuildConfig(interaction.guildId);

    // Check if desired number is within allowed range
    if (!isInRange(quantity, 1, maxMessagesCleared)) {
      await interaction.followUp({
        content: `You can not clear ${quantity} messages! Allowed range is from 1 to ${maxMessagesCleared}.`,
      });
      return;
    }

    const channel = interaction.channel as TextChannel;

    const messagesToDelete = await channel.messages.fetch({
      limit: quantity,
      before: interaction.id,
    });

    try {
      // Note: 2nd argument in bulkDelete filters out messages +2 weeks old, as they cannot be deleted via bulkDelete
      await channel.bulkDelete(messagesToDelete, true);
    } catch (err) {
      logger.error("Errored while trying to bulkDelete messages", err);

      await interaction.followUp({
        content: `Errored while trying to bulkDelete messages! Make sure you are not 
        (1) deleting more than are in the channel or (2) trying to delete messages made +2 weeks ago.`,
      });
      return;
    }

    // Confirmation message
    await tempMessage(interaction, `Cleared \`${quantity}\` message${quantity === 1 ? "" : "s"}`, {
      durationInSeconds: 3,
      countdownIntervalInSeconds: 1,
    });
  }
);
