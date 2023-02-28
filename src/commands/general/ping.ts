import { SlashCommandBuilder } from "discord.js";
import type { Message } from "discord.js";

import Command from "../../structures/Command";

export = new Command(
  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Shows the ping of the bot.")
    .addBooleanOption((option) => option.setName("verbose").setDescription("Show more verbose description.")),

  async (client, interaction) => {
    const verbose = interaction.options.getBoolean("verbose") || false;

    const pingVerbose = ` Average time between regularly sent signals (websocket heartbeat).`;
    const pingStr = `Ping: **${client.ws.ping} ms**.${verbose ? pingVerbose : ""}`;

    const pingMessage = (await interaction.followUp({
      content: pingStr,
    })) as Message<boolean>;

    const rtLatencyVerbose = ` Time between command message creation and response message creation.`;
    const rtLatency = pingMessage.createdTimestamp - interaction.createdTimestamp;
    const rtLatencyStr = `Roundtrip latency: **${rtLatency} ms**.${verbose ? rtLatencyVerbose : ""}`;

    await pingMessage.edit({
      content: `${pingStr}\n${rtLatencyStr}`,
    });
  }
);
