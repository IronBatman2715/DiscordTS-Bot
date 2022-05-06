import { SlashCommandBuilder } from "@discordjs/builders";
import type { Message } from "discord.js";

import Command from "../../structures/Command";

export = new Command(
  new SlashCommandBuilder().setName("ping").setDescription("Shows the ping of the bot."),

  async (client, interaction) => {
    const clientPing = (await interaction.followUp({
      content: `Ping: ${client.ws.ping} ms.`,
    })) as Message<boolean>;

    return await clientPing.edit({
      content: `Ping: ${client.ws.ping} ms. \nMessage Ping: ${
        clientPing.createdTimestamp - interaction.createdTimestamp
      } ms.`,
    });
  }
);
