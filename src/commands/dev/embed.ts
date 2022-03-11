import { GuildMember } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";

import Command from "../../structures/Command";

export = new Command(
	new SlashCommandBuilder().setName("embed").setDescription("DEV ONLY: Shows a test embed."),

	async (client, interaction) => {
		const testEmbed = client.genEmbed({
			title: `Test embed`,
			description: `This is a cool test embed!`,
			url: "https://discord.js.org/#/docs/main/stable/general/welcome",
			timestamp: interaction.createdTimestamp,
			color: "DARK_BLUE",
			fields: [
				{
					name: "Test field name",
					value: "Test field value",
					inline: false,
				},
				{
					//Reminder that channels, users, and roles can NOT be linked inside embed fields
					name: `Test channel field name: ${await interaction.guild?.channels.fetch(interaction.channelId)}`,
					value: "Test channel field value",
					inline: false,
				},
			],
			author: {
				name: interaction.member?.user.username,
				url: "https://ironbatman2715.github.io/",
				iconURL: (interaction.member as GuildMember).avatarURL({ dynamic: true }) || "",
			},
			thumbnail: {
				url: "https://www.seoptimer.com/blog/wp-content/uploads/2018/09/image22.png",
			},
			image: {
				url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/U%2B2160.svg/1200px-U%2B2160.svg.png",
			},
			footer: {
				text: client.config.name,
			},
		});

		return await interaction.followUp({
			embeds: [testEmbed],
		});
	}
);
