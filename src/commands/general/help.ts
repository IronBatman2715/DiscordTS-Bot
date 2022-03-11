import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageSelectOptionData, MessageActionRow, MessageSelectMenu } from "discord.js";

import Command from "../../structures/Command";

export = new Command(
	new SlashCommandBuilder().setName("help").setDescription("Show a list of available commands."),

	async (client, interaction) => {
		if (!(client.commandCategories.length > 0)) {
			return await interaction.followUp({
				content: "No command categories exist!",
			});
		}

		const commandCategories: MessageSelectOptionData[] = client.commandCategories
			.filter((category) => category !== "dev")
			.map((category) => {
				return {
					label: category[0].toUpperCase() + category.slice(1).toLowerCase(),
					value: category,
				};
			});

		const helpEmbed = client.genEmbed({
			title: "Select a command category below!",
		});

		await interaction.followUp({
			embeds: [helpEmbed],
			components: [
				new MessageActionRow().addComponents([
					new MessageSelectMenu()
						.setCustomId(`${client.config.name}-help-select-menu`)
						.setPlaceholder("Select a Command category")
						.setMinValues(1)
						.setMaxValues(1)
						.setOptions(commandCategories),
				]),
			],
		});
	}
);
