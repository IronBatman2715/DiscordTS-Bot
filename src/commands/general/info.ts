import type { EmbedField } from "discord.js";
import { ActivityType, SlashCommandBuilder } from "discord.js";

import type { ActivitiesOptions } from "../../botConfig.js";
import { camel2Display } from "../../functions/general/strings.js";
import Command from "../../structures/Command.js";

export default new Command(
  new SlashCommandBuilder().setName("info").setDescription("Shows information about this bot."),

  async (client, interaction) => {
    const fields: EmbedField[] = Object.entries(client.config).map(([key, value]) => {
      let formattedValue = "";
      switch (key) {
        case "name": {
          formattedValue = value as string;
          break;
        }
        case "activities": {
          (value as ActivitiesOptions[]).forEach(({ name, type, url }) => {
            formattedValue += url ? `[${ActivityType[type]} ${name}](${url})\n` : `${ActivityType[type]} ${name}\n`;
          });
          break;
        }
        default: {
          throw new Error(`Unexpected key in "client.config"`);
        }
      }

      return {
        name: camel2Display(key),
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
