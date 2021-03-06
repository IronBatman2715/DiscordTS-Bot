import { InteractionType, ApplicationCommandType } from "discord.js";

import { ClientEvent } from "../../structures/Event";
import logger from "../../logger";

export = new ClientEvent("interactionCreate", async (client, interaction) => {
  if (
    interaction.type === InteractionType.ApplicationCommand &&
    interaction.commandType === ApplicationCommandType.ChatInput
  ) {
    logger.verbose("ChatInputCommandInteraction created!", { interaction });

    // Get command
    const command = client.commands.get(interaction.commandName);

    // If command name is not valid, do nothing
    if (!command) return;

    // Show user that command is loading
    await interaction.deferReply().catch((error) => {
      logger.error(error);
    });

    client.runCommand(command, interaction);
  }
});
