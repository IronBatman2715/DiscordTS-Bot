import { SlashCommandBuilder } from "discord.js";

import Command from "../../structures/Command.js";

export default new Command(
  new SlashCommandBuilder()
    .setName("echo")
    .setDescription("DEVELOPER ONLY: Repeats a message back to you!")
    .addStringOption((options) => options.setName("message").setDescription("Message to echo").setRequired(true)),

  async (_client, interaction) => {
    const message = interaction.options.getString("message", true);

    await interaction.followUp({ content: message });
  }
);
