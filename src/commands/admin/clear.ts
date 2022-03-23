import { TextChannel } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";

import Command from "../../structures/Command";
import isInRange from "../../functions/general/isInRange";
import tempMessage from "../../functions/discord/tempMessage";

export = new Command(
  new SlashCommandBuilder()
    .setName("clear")
    .setDescription("ADMIN ONLY: Clear messages from the text channel! (Cannot clear older than 2 weeks)")
    .addIntegerOption((option) =>
      option.setName("quantity").setDescription("Number of messages to delete").setRequired(true)
    ),

  async (client, interaction) => {
    const quantity = interaction.options.getInteger("quantity", true);

    const guildConfig = await client.DB.getGuildConfig(interaction.guildId);
    if (typeof guildConfig === "undefined") return;
    const { maxMessagesCleared } = guildConfig;

    //Check if desired number is within allowed range
    if (!isInRange(quantity, 1, maxMessagesCleared)) {
      return await interaction.followUp({
        content: `You can not clear ${quantity} messages! Allowed range is from 1 to ${maxMessagesCleared}.`,
      });
    }

    const channel = interaction.channel as TextChannel;

    const messagesToDelete = await channel.messages.fetch({
      limit: quantity,
      before: interaction.id,
    });

    //Note: 2nd argument in bulkDelete filters out messages >=2 weeks old, as they cannot be deleted via bulkDelete
    await channel.bulkDelete(messagesToDelete, true);

    //Confirmation message
    await tempMessage(interaction, `Cleared \`${quantity}\` message${quantity == 1 ? "" : "s"}`, true, 3, 1);
  }
);
