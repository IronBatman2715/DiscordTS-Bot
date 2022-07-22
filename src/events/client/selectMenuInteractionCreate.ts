import type { EmbedField } from "discord.js";

import { ClientEvent } from "../../structures/Event";
import logger from "../../logger";

export = new ClientEvent("interactionCreate", async (client, interaction) => {
  if (interaction.isSelectMenu()) {
    logger.verbose("SelectMenuInteraction created!", { interaction });
    logger.verbose(`values selected: [${interaction.values}]`);

    // Show user that select menu is loading
    await interaction.deferUpdate().catch((error) => {
      logger.error(error);
    });

    switch (interaction.customId) {
      case "test-select-menu-id": {
        const [choice] = interaction.values;

        const testMenuEmbed = client.genEmbed({
          title: "Test Select Menu",
          description: `You selected: ${choice}`,
        });

        await interaction.editReply({
          embeds: [testMenuEmbed],
        });

        break;
      }
      case `${client.config.name}-help-select-menu`: {
        const [dir] = interaction.values;

        const dirName = dir[0].toUpperCase() + dir.slice(1);

        const commandObjArr: EmbedField[] = client.commands
          .filter((command) => command.category === dir)
          .map((command) => {
            return {
              name: `\`${command.builder.name}\``,
              value: `${command.builder.description}`,
              inline: true,
            };
          });

        const helpMenuEmbed = client.genEmbed({
          title: `${dirName} Commands`,
          fields: commandObjArr,
        });

        await interaction.editReply({
          embeds: [helpMenuEmbed],
        });

        break;
      }

      default: {
        logger.error(new ReferenceError("Could not match customId of select menu to one of this bot's!"));
      }
    }
  }
});
