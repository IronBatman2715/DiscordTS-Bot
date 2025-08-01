import {
  ActionRowBuilder,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";

import Command from "../../structures/Command.js";

export default new Command(
  new SlashCommandBuilder()
    .setName("menu")
    .setDescription("DEVELOPER ONLY: Shows a test menu.")
    .addIntegerOption(
      (option) =>
        option
          .setName("number-of-options")
          .setDescription("Number of options to generate.")
          .setRequired(true)
          .setMinValue(1)
          .setMaxValue(25) // see Client.normalizeStringSelectMenuOptions
    ),

  async (_client, interaction) => {
    const numOfOptions = interaction.options.getInteger("number-of-options", true);

    const options = Array.from({ length: numOfOptions }, (_, i) => {
      return new StringSelectMenuOptionBuilder()
        .setLabel(`Option ${i + 1} label`)
        .setValue(`Option ${i + 1} value`)
        .setDescription(`Option ${i + 1} description`);
    });

    await interaction.followUp({
      content: "Select something below!",
      components: [
        new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(
          new StringSelectMenuBuilder()
            .setCustomId("test-select-menu-id")
            .setPlaceholder("Choose something")
            .setMinValues(1)
            .setMaxValues(1)
            .setOptions(options)
        ),
      ],
    });
  }
);
