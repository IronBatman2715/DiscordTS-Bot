import Client from "../../structures/Client";
import { ClientEvent } from "../../structures/Event";
import logger from "../../structures/Logger";

export = new ClientEvent("interactionCreate", async (interaction) => {
  if (interaction.isChatInputCommand()) {
    logger.verbose("ChatInputCommandInteraction created!", { interaction });

    const client = Client.get();

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
