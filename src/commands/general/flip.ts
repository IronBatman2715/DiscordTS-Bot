import { SlashCommandBuilder } from "discord.js";

import Command from "../../structures/Command.js";

export default new Command(
  new SlashCommandBuilder().setName("flip").setDescription("Flip a coin!"),

  async (_client, interaction) => {
    const result = Math.floor(Math.random() * 2);

    const resultStr = result == 0 ? "HEADS" : "TAILS";

    await interaction.followUp({
      content: resultStr,
    });
  }
);
