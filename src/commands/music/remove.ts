import { SlashCommandBuilder } from "@discordjs/builders";

import Command from "../../structures/Command";
import isInRange from "../../functions/general/isInRange";
import tempMessage from "../../functions/discord/tempMessage";
import getGuildQueue from "../../functions/music/getGuildQueue";
import getOrdinalSuffix from "../../functions/general/getOrdinalSuffix";

export = new Command(
	new SlashCommandBuilder()
		.setName("remove")
		.setDescription("Remove a song from the music queue.")
		.addIntegerOption((option) =>
			option.setName("queue-number").setDescription("Number of song in queue.").setRequired(true)
		),
	async (client, interaction) => {
		//Add ability to remove multiple at a time eventually..?

		//Get queue
		const guildQueue = await getGuildQueue(client, interaction);
		if (typeof guildQueue === "undefined") return;

		const index = interaction.options.getInteger("queue-number", true); //place in queue (starts at 1)
		//console.log("Input removal index: ", index);
		const arrayIndex = index - 1; //song array index (starts at 0)
		//console.log("Array-wise removal index: ", index);

		if (!isInRange(index, 1, guildQueue.songs.length)) {
			return interaction.followUp({
				content: `Must enter the song's place in the queue! (Ex: Remove 3rd song in queue: "/remove 3")`,
			});
		}

		if (arrayIndex < 0 || arrayIndex > guildQueue.songs.length) {
			return interaction.followUp({
				content: "Song number entered does not exist in this queue!",
			});
		}

		const removedSong = guildQueue.songs[arrayIndex];
		guildQueue.remove(arrayIndex);

		await tempMessage(
			interaction,
			`Removed the ${index}${getOrdinalSuffix(index)} song from the queue! (${removedSong.name})`
		);
	}
);
