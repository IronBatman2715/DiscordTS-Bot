import { SlashCommandBuilder } from "@discordjs/builders";

import Command from "../../structures/Command";
import getGuildQueue from "../../functions/music/getGuildQueue";
import isInRange from "../../functions/general/isInRange";

export = new Command(
	new SlashCommandBuilder()
		.setName("skip")
		.setDescription("Skip a number of song(s) [default: 1].")
		.addIntegerOption((option) => option.setName("quantity").setDescription("Number of songs to skip.")),
	async (client, interaction) => {
		//Get queue
		const guildQueue = await getGuildQueue(client, interaction);
		if (typeof guildQueue === "undefined") {
			return interaction.followUp({
				content: "Cannot set the repeat mode of a queue that has not been started!",
			});
		}

		const quantity = interaction.options.getInteger("quantity");
		if (quantity === null) {
			if (guildQueue.songs.length == 1) {
				return await interaction.followUp({
					content: "Cannot skip as many or more songs than are in the queue!",
				});
			}
			guildQueue.skip();
		} else {
			if (!isInRange(quantity, 1, guildQueue.songs.length - 1)) {
				return await interaction.followUp({
					content: "Cannot skip as many or more songs than are in the queue!",
				});
			}
			guildQueue.skip(quantity - 1);
		}

		await interaction.deleteReply();
	}
);
