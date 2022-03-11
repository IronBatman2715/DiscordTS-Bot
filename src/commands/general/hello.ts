import { SlashCommandBuilder } from "@discordjs/builders";

import Command from "../../structures/Command";

export = new Command(
	new SlashCommandBuilder().setName("hello").setDescription("Replies with a greeting."),

	async (client, interaction) => {
		const guildConfig = await client.DB.getGuildConfig(interaction.guildId);
		if (typeof guildConfig === "undefined") return;
		const { greetings } = guildConfig;

		return await interaction.followUp({
			content: greetings[Math.floor(Math.random() * greetings.length)],
		});
	}
);
