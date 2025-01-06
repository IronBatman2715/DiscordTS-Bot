import { SlashCommandBuilder } from "discord.js";

import Command from "../../structures/Command.js";
import { getGuildConfig } from "../../structures/DB.js";

export default new Command(
  new SlashCommandBuilder().setName("hello").setDescription("Replies with a greeting."),

  async (_client, interaction) => {
    const { greetings } = await getGuildConfig(interaction.guildId);

    await interaction.followUp({
      content: greetings[Math.floor(Math.random() * greetings.length)],
    });
  }
);
