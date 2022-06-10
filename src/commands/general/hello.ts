import { SlashCommandBuilder } from "@discordjs/builders";

import Command from "../../structures/Command";

export = new Command(
  new SlashCommandBuilder().setName("hello").setDescription("Replies with a greeting."),

  async (client, interaction) => {
    const { greetings } = await client.DB.getGuildConfig(interaction.guildId);

    await interaction.followUp({
      content: greetings[Math.floor(Math.random() * greetings.length)],
    });
  }
);
