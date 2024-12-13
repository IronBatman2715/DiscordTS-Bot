/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { SlashCommandBuilder } from "discord.js";

import Command from "../../structures/Command.js";

export default new Command(
  new SlashCommandBuilder()
    .setName("roll")
    .setDescription("Roll the dice!")
    .addIntegerOption((option) =>
      option.setName("quantity").setDescription("Number of dice to roll.").setRequired(true).setMinValue(1)
    )
    .addIntegerOption((option) =>
      option.setName("sides").setDescription("Dice side quantity.").setRequired(true).setMinValue(2)
    )
    .addIntegerOption((option) =>
      option
        .setName("modifier")
        .setDescription("Value to add/subtract from the result. [default: 0]")
        .setRequired(false)
    ),

  async (_client, interaction) => {
    const quantity = interaction.options.getInteger("quantity", true);
    const sides = interaction.options.getInteger("sides", true);

    // Set modifier to 0 unless value is entered
    const modifier =
      interaction.options.getInteger("modifier") === null ? 0 : interaction.options.getInteger("modifier", true);
    const isNonZeroModifier = modifier !== 0;

    // Array of dice roll(s)
    const results = Array.from({ length: quantity }, () => Math.floor(Math.random() * sides) + 1);

    // Sum of dice roll(s) and modifier
    const total = results.reduce((a, b) => a + b) + modifier;

    const modifierStr = isNonZeroModifier ? `${modifier > 0 ? `+` : `-`} *${Math.abs(modifier)}* ` : ``;

    const resultStr = isNonZeroModifier || results.length > 1 ? ` [${results}] ${modifierStr} ➡️` : ``;

    await interaction.followUp({
      content: `${quantity}d${sides} ${modifierStr}➡️${resultStr} **${total}**`,
    });
  }
);
