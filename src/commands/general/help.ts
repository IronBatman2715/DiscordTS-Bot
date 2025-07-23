import {
  ActionRowBuilder,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";

import Command from "../../structures/Command.js";

export default new Command(
  new SlashCommandBuilder().setName("help").setDescription("Show a list of available commands."),

  async (client, interaction) => {
    if (!(client.commandCategories.length > 0)) {
      await interaction.followUp({
        content: "No command categories exist!",
      });
      return;
    }

    const [options, isTruncated] = client.normalizeStringSelectMenuOptions(
      client.commandCategories.map((category) => {
        return new StringSelectMenuOptionBuilder()
          .setLabel(category[0].toUpperCase() + category.slice(1).toLowerCase())
          .setValue(category);
      })
    );

    const helpEmbed = client.genEmbed({
      title: "Select a command category below!",
    });

    await interaction.followUp({
      content: isTruncated ? "Truncated help menu! You have too many categories" : undefined,
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
