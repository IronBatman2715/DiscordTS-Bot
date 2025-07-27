import logger from "../../logger.js";
import Client from "../../structures/Client.js";
import { ClientEvent } from "../../structures/Event.js";

export default new ClientEvent("interactionCreate", async (interaction) => {
  if (interaction.isChatInputCommand()) {
    logger.verbose("ChatInputCommandInteraction created!", { interaction });

    const client = await Client.get();

    // Get command
    const command = client.commands.get(interaction.commandName);

    // If command name is not valid, do nothing
    if (!command) {
      await interaction.reply({ content: `'/${command}' is not valid for this bot!` });
      return;
    }

    await client.runCommand(command, interaction);
  }
});
