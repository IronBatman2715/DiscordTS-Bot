import type { SelectMenuComponentOptionData } from "discord.js";
import { ActionRowBuilder, SlashCommandBuilder, StringSelectMenuBuilder } from "discord.js";

import Command from "../../structures/Command.js";

export default new Command(
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

  async (_client, interaction) => {
    const numOfOptions = interaction.options.getInteger("number-of-options", true);

    /* eslint-disable @typescript-eslint/restrict-template-expressions */
    const options: SelectMenuComponentOptionData[] = Array.from({ length: numOfOptions }, (_, i) => {
      return {
        label: `Option ${i + 1} label`,
        value: `Option ${i + 1} value`,
        description: `Option ${i + 1} description` /*,
        emoji: `1️⃣`,*/,
      };
    });
    /* eslint-enable @typescript-eslint/restrict-template-expressions */

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
