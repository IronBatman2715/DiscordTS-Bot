import { ActivityType, SlashCommandBuilder } from "discord.js";
import type { EmbedField } from "discord.js";

import Command from "../../structures/Command";
import camelCase2Display from "../../functions/general/camelCase2Display";
import type { ActivitiesOptions } from "../../botConfig";

export = new Command(
  new SlashCommandBuilder().setName("info").setDescription("Shows information about this bot."),

  async (client, interaction) => {
    const fields: EmbedField[] = Object.entries(client.config).map(([key, value]) => {
      let formattedValue = "";
      switch (key) {
        case "activities": {
          (value as ActivitiesOptions[]).forEach(({ name, type, url }) => {
            formattedValue += `[${ActivityType[type]} ${name}](${url ?? ""})\n`;
          });
          break;
        }
        default: {
          formattedValue = value.toString();
          break;
        }
      }

      return {
        name: camelCase2Display(key),
        value: formattedValue,
        inline: false,
      };
    });

    const infoEmbed = client.genEmbed({
      title: `${client.config.name}@${client.version}`,
      description:
        "A customizable Discord bot based on [discord.js v14](https://discord.js.org/ 'https://discord.js.org/') with " +
        "[Typescript](https://www.typescriptlang.org/ 'https://www.typescriptlang.org/')!\n" +
        "Source code on [Github](https://github.com/IronBatman2715/DiscordTS-Bot 'https://github.com/IronBatman2715/DiscordTS-Bot').\n\n" +
        "Bot Configuration:",
      fields,
    });

    await interaction.followUp({
      embeds: [infoEmbed],
    });
  }
);
