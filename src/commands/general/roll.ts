import { SlashCommandBuilder } from "@discordjs/builders";

import Command from "../../structures/Command";
import isInRange from "../../functions/general/isInRange";

export = new Command(
	new SlashCommandBuilder()
		.setName("roll")
		.setDescription("Roll the dice!")
		.addIntegerOption((option) =>
			option.setName("quantity").setDescription("Number of dice to roll.").setRequired(true)
		)
		.addIntegerOption((option) => option.setName("sides").setDescription("Dice side quantity.").setRequired(true))
		.addIntegerOption((option) =>
			option
				.setName("modifier")
				.setDescription("Value to add/subtract from the result. [default: 0]")
				.setRequired(false)
		),

	async (client, interaction) => {
		const quantity = interaction.options.getInteger("quantity", true);
		const sides = interaction.options.getInteger("sides", true);

		//Set modifier to 0 unless value is entered
		const modifier =
			interaction.options.getInteger("modifier") === null ? 0 : interaction.options.getInteger("modifier", true);
		const isNonZeroModifier = modifier !== 0;

		//Verify arguments
		if (!isInRange(quantity)) {
			return await interaction.followUp({
				content: `Number of dice must be greater than 0! Entered: ${quantity}`,
			});
		}
		if (!isInRange(sides, 2)) {
			return await interaction.followUp({
				content: `Sides of dice must be greater than 1! Entered: ${sides}`,
			});
		}

		//Array of dice roll(s)
		const results = Array.from({ length: quantity }, () => Math.floor(Math.random() * sides) + 1);

		//Sum of dice roll(s)
		const total = results.reduce((a, b) => a + b) + modifier;

		const modifierStr = isNonZeroModifier ? `${modifier > 0 ? `+` : `-`} *${Math.abs(modifier)}* ` : ``;

		const resultStr = isNonZeroModifier || results.length > 1 ? ` [${results}] ${modifierStr} ➡️` : ``;

		return await interaction.followUp({
			content: `${quantity}d${sides} ${modifierStr}➡️${resultStr} **${total}**`,
		});
	}
);
