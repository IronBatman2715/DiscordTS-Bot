import { SlashCommandBuilder } from "discord.js";

import Command from "../../structures/Command.js";

export default new Command(
  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Shows the ping of the bot.")
    .addBooleanOption((option) => option.setName("verbose").setDescription("Show more verbose description.")),

  async (client, interaction) => {
    const verbose = interaction.options.getBoolean("verbose") ?? false;

    const pingVerbose = ` Average time between regularly sent signals (websocket heartbeat).`;
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    const pingStr = `Ping: **${client.ws.ping} ms**.${verbose ? pingVerbose : ""}`;

    const pingMessage = await interaction.followUp({
      content: pingStr,
    });

    const rtLatencyVerbose = ` Time between command message creation and response message creation.`;
    const rtLatency = pingMessage.createdTimestamp - interaction.createdTimestamp;
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    const rtLatencyStr = `Roundtrip latency: **${rtLatency} ms**.${verbose ? rtLatencyVerbose : ""}`;

    await pingMessage.edit({
      content: `${pingStr}\n${rtLatencyStr}`,
    });
  }
);
