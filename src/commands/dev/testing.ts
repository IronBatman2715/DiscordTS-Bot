import { SlashCommandBuilder } from "discord.js";

import Command from "../../structures/Command.js";

export default new Command(
  new SlashCommandBuilder().setName("testing").setDescription('DEVELOPER ONLY: Replies with "1, 2, 3!".'),

  async (_client, interaction) => {
    await interaction.followUp({ content: "1, 2, 3!" });
  }
);
