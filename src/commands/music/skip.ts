import { SlashCommandBuilder } from "@discordjs/builders";

import Command from "../../structures/Command";
import getGuildQueue from "../../functions/music/getGuildQueue";
import { isInRange } from "../../functions/general/math";

export = new Command(
  new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Skip a number of song(s) [default: 1].")
    .addIntegerOption((option) => option.setName("quantity").setDescription("Number of songs to skip.").setMinValue(1)),
  async (client, interaction) => {
    //Get queue
    const guildQueue = await getGuildQueue(client, interaction);
    if (typeof guildQueue === "undefined") {
      return interaction.followUp({
        content: "No active music queue to skip a song in!",
      });
    }

    const quantity =
      interaction.options.getInteger("quantity") === null ? 1 : interaction.options.getInteger("quantity", true);

    if ((quantity === 1 && guildQueue.songs.length === 1) || !isInRange(quantity, 1, guildQueue.songs.length - 1)) {
      return await interaction.followUp({
        content: "Cannot skip as many or more songs than are in the queue!",
      });
    }

    guildQueue.skip(quantity - 1); //quantity - 1 = song index to skip

    await interaction.deleteReply();
  }
);
