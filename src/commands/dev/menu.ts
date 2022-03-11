import { MessageActionRow, MessageSelectMenu, MessageSelectOptionData } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";

import Command from "../../structures/Command";
import isInRange from "../../functions/general/isInRange";

export = new Command(
	new SlashCommandBuilder()
		.setName("menu")
		.setDescription("DEV ONLY: Shows a test menu.")
		.addIntegerOption((option) =>
			option.setName("number-of-options").setDescription("Number of options to generate.").setRequired(true)
		),

	async (client, interaction) => {
		const numOfOptions = interaction.options.getInteger("number-of-options", true);

		//Check if is in allowed range
		if (!isInRange(numOfOptions)) {
			return await interaction.followUp({
				content: `Entered value is out of allowed range: [1, ${Number.MAX_SAFE_INTEGER}]!`,
			});
		}

		const options: MessageSelectOptionData[] = Array.from({ length: numOfOptions }, (x, i) => {
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
				new MessageActionRow().setComponents(
					new MessageSelectMenu()
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
