import { GuildMember } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";

import Command from "../../structures/Command";
import getGuildQueue from "../../functions/music/getGuildQueue";

export = new Command(
	new SlashCommandBuilder()
		.setName("play")
		.setDescription("Plays a song or adds it to the end of the music queue.")
		.addStringOption((option) =>
			option
				.setName("song-query")
				.setDescription("A URL (youtube, spotify, or apple music) or search query.")
				.setRequired(true)
		),
	async (client, interaction) => {
		const voiceChannel = (interaction.member as GuildMember).voice.channel;

		//Check if user is currently in a voice channel
		if (!voiceChannel) {
			return await interaction.followUp({
				content: "Join a voice channel first!",
			});
		}

		const songQuery = interaction.options.getString("song-query", true);

		const guildQueue = await getGuildQueue(client, interaction, true);
		if (typeof guildQueue === "undefined") return;

		await guildQueue.join(voiceChannel);

		await guildQueue.play(songQuery, {
			timecode: true,
			requestedBy: interaction.user,
		});
	}
);
