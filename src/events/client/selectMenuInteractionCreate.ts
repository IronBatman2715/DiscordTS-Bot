import { EmbedFieldData } from "discord.js";

import { ClientEvent } from "../../structures/Event";

export = new ClientEvent("interactionCreate", async (client, interaction) => {
	if (interaction.isSelectMenu()) {
		//console.log("SelectMenuInteraction created!");
		//console.log("values selected: ", interaction.values);

		//Show user that select menu is loading
		await interaction.deferUpdate().catch((error) => {
			console.error(error);
		});

		switch (interaction.customId) {
			case "test-select-menu-id": {
				const [choice] = interaction.values;

				const testMenuEmbed = client.genEmbed({
					title: "Test Select Menu",
					description: `You selected: ${choice}`,
				});

				return await interaction.editReply({
					embeds: [testMenuEmbed],
				});
			}
			case `${client.config.name}-help-select-menu`: {
				const [dir] = interaction.values;

				const dirName = dir[0].toUpperCase() + dir.slice(1);

				const commandObjArr: EmbedFieldData[] = client.commands
					.filter((command) => command.category === dir)
					.map((command) => {
						return {
							name: `\`${command.builder.name}\``,
							value: `${command.builder.description}`,
							inline: true,
						};
					});

				const helpMenuEmbed = client.genEmbed({
					title: `${dirName} Commands`,
					fields: commandObjArr,
				});

				return await interaction.editReply({
					embeds: [helpMenuEmbed],
				});
			}

			default: {
				return console.error("Could not match customId of select menu to one of this bot's!");
			}
		}
	}
});
