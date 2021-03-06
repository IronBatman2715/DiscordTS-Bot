import { SlashCommandBuilder } from "@discordjs/builders";

import Command from "../../structures/Command";

export = new Command(
  new SlashCommandBuilder()
    .setName("echo")
    .setDescription("DEVELOPER ONLY: Repeats a message back to you!")
    .addStringOption((options) => options.setName("message").setDescription("Message to echo").setRequired(true)),

  async (client, interaction) => {
    const message = interaction.options.getString("message", true);

    await interaction.followUp({ content: message });
  }
);
