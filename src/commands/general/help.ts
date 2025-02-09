import {
  ActionRowBuilder,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";

import logger from "../../logger.js";
import Command from "../../structures/Command.js";

// TODO: standardize this normalization of components similar to `Client.genEmbed` (i.e. `Client.genComponents`)
const truncatedMessage =
  "`/help` tried to generate a menu with more than 25 options! You have too many command categories to display in a singular help menu. Truncating output to 25.";

export default new Command(
  new SlashCommandBuilder().setName("help").setDescription("Show a list of available commands."),

  async (client, interaction) => {
    if (!(client.commandCategories.length > 0)) {
      await interaction.followUp({
        content: "No command categories exist!",
      });
      return;
    }

    const [commandCategories, isTruncated] = normalizeSelectMenuOptions(client.commandCategories);

    const options = commandCategories.map((category) => {
      return new StringSelectMenuOptionBuilder()
        .setLabel(category[0].toUpperCase() + category.slice(1).toLowerCase())
        .setValue(category);
    });

    if (isTruncated) {
      logger.warn(new RangeError(truncatedMessage));
    }

    const helpEmbed = client.genEmbed({
      title: "Select a command category below!",
    });

    await interaction.followUp({
      content: isTruncated ? truncatedMessage : undefined,
      embeds: [helpEmbed],
      components: [
        new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(
          new StringSelectMenuBuilder()
            .setCustomId(`${client.config.name}-help-select-menu`)
            .setPlaceholder("Select a Command category")
            .setMinValues(1)
            .setMaxValues(1)
            .setOptions(options)
        ),
      ],
    });
  }
);

function normalizeSelectMenuOptions(options: string[]): [string[], boolean] {
  if (options.length > 25) {
    return [options.slice(0, 25), true];
  } else {
    return [options, false];
  }
}
