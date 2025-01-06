import { SlashCommandBuilder } from "discord.js";

import { getGuildConfig } from "../../database/GuildConfig.js";
import Command from "../../structures/Command.js";

export default new Command(
  new SlashCommandBuilder().setName("hello").setDescription("Replies with a greeting."),

  async (_client, interaction) => {
    const { greetings } = await getGuildConfig(interaction.guildId);

    await interaction.followUp({
      content: greetings[Math.floor(Math.random() * greetings.length)],
    });
  }
);
