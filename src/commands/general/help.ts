import type { SelectMenuComponentOptionData } from "discord.js";
import { ActionRowBuilder, SlashCommandBuilder, StringSelectMenuBuilder } from "discord.js";

import Command from "../../structures/Command.js";
import logger from "../../structures/Logger.js";

export default new Command(
  new SlashCommandBuilder().setName("help").setDescription("Show a list of available commands."),

  async (client, interaction) => {
    if (!(client.commandCategories.length > 0)) {
      return await interaction.followUp({
        content: "No command categories exist!",
      });
    }

    const commandCategories: SelectMenuComponentOptionData[] = client.commandCategories
      .filter((category) => category !== "dev")
      .map((category) => {
        return {
          label: category[0].toUpperCase() + category.slice(1).toLowerCase(),
          value: category,
        };
      });

    if (commandCategories.length > 25) {
      logger.error(
        new RangeError(
          "`/help` tried to generate a menu with more than 25 options! You have too many command categories to display in a singular help menu."
        )
      );
      while (commandCategories.length > 25) {
        commandCategories.pop();
      }
    }

    const helpEmbed = client.genEmbed({
      title: "Select a command category below!",
    });

    await interaction.followUp({
      embeds: [helpEmbed],
      components: [
        new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(
          new StringSelectMenuBuilder()
            .setCustomId(`${client.config.name}-help-select-menu`)
            .setPlaceholder("Select a Command category")
            .setMinValues(1)
            .setMaxValues(1)
            .setOptions(commandCategories)
        ),
      ],
    });
  }
);
