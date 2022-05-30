import { SlashCommandBuilder } from "@discordjs/builders";

import Command from "../../structures/Command";

export = new Command(
  new SlashCommandBuilder().setName("testing").setDescription('DEVELOPER ONLY: Replies with "1, 2, 3!".'),

  async (client, interaction) => {
    await interaction.followUp({ content: "1, 2, 3!" });
  }
);
