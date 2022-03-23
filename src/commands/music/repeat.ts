import { SlashCommandBuilder } from "@discordjs/builders";
import { RepeatMode } from "discord-music-player";

import Command from "../../structures/Command";
import getGuildQueue from "../../functions/music/getGuildQueue";

export = new Command(
  new SlashCommandBuilder()
    .setName("repeat")
    .setDescription("Set the repeat mode of the music queue.")
    .addIntegerOption((option) =>
      option
        .setName("option")
        .setDescription("Repeat mode to use.")
        .setRequired(true)
        .addChoice("disable", RepeatMode.DISABLED)
        .addChoice("song", RepeatMode.SONG)
        .addChoice("queue", RepeatMode.QUEUE)
    ),

  async (client, interaction) => {
    //Get queue
    const guildQueue = await getGuildQueue(client, interaction);
    if (typeof guildQueue === "undefined") {
      return interaction.followUp({
        content: "Cannot set the repeat mode of a queue that has not been started!",
      });
    }

    const repeatMode = interaction.options.getInteger("option", true);
    const repeatModeStr = RepeatMode[repeatMode].toLowerCase();

    //Change the repeat behvior of the queue
    if (guildQueue.repeatMode == repeatMode) {
      return interaction.followUp({
        content: `Already set to that repeat mode (${repeatModeStr})!`,
      });
    }
    guildQueue.setRepeatMode(repeatMode);
    return interaction.followUp({
      content: `Set music queue repeat mode to: ${repeatModeStr}!`,
    });
  }
);
