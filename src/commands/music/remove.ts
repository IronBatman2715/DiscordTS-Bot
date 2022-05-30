import { SlashCommandBuilder } from "@discordjs/builders";

import Command from "../../structures/Command";
import { isInRange } from "../../functions/general/math";
import tempMessage from "../../functions/discord/tempMessage";
import getGuildQueue from "../../functions/music/getGuildQueue";
import getOrdinalSuffix from "../../functions/general/getOrdinalSuffix";

export = new Command(
  new SlashCommandBuilder()
    .setName("remove")
    .setDescription("Remove a song from the music queue.")
    .addIntegerOption((option) =>
      option.setName("queue-number").setDescription("Number of song in queue.").setRequired(true).setMinValue(1)
    ),
  async (client, interaction) => {
    //Add ability to remove multiple at a time eventually..?

    //Get queue
    const guildQueue = await getGuildQueue(client, interaction);
    if (typeof guildQueue === "undefined") {
      return await interaction.followUp({
        content: "No active music queue to remove a song from!",
      });
    }

    const songNumber = interaction.options.getInteger("queue-number", true); //place in queue (starts at 1)
    const index = songNumber - 1; //song array index (starts at 0)

    if (!isInRange(songNumber, 1, guildQueue.songs.length)) {
      return await interaction.followUp({
        content: `Song number entered does not exist in this queue! (Ex: Remove 3rd song in queue: "/remove 3")`,
      });
    }

    const removedSong = guildQueue.songs[index];
    guildQueue.remove(index);

    await tempMessage(
      interaction,
      `Removed the ${songNumber}${getOrdinalSuffix(songNumber)} song from the queue! (${removedSong.name})`
    );
  }
);
