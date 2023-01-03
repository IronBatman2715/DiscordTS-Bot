import { ActionRowBuilder, StringSelectMenuBuilder } from "discord.js";
import type { SelectMenuComponentOptionData } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";

import Command from "../../structures/Command";

export = new Command(
  new SlashCommandBuilder()
    .setName("menu")
    .setDescription("DEVELOPER ONLY: Shows a test menu.")
    .addIntegerOption((option) =>
      option
        .setName("number-of-options")
        .setDescription("Number of options to generate.")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(25)
    ),

  async (client, interaction) => {
    const numOfOptions = interaction.options.getInteger("number-of-options", true);

    const options: SelectMenuComponentOptionData[] = Array.from({ length: numOfOptions }, (_, i) => {
      return {
        label: `Option ${i + 1} label`,
        value: `Option ${i + 1} value`,
        description: `Option ${i + 1} description` /*,
        emoji: `1️⃣`,*/,
      };
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
