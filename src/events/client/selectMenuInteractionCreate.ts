import type { EmbedField } from "discord.js";
import { useQueue } from "discord-player";

import { fromKebabString } from "../../functions/music/queuePageState.js";
import logger from "../../logger.js";
import Client from "../../structures/Client.js";
import { ClientEvent } from "../../structures/Event.js";
import type QueueMetadata from "../../structures/QueueMetadata.js";
import { QueuePageState } from "../../structures/QueueMetadata.js";

export default new ClientEvent("interactionCreate", async (interaction) => {
  if (interaction.isStringSelectMenu()) {
    logger.verbose("SelectMenuInteraction created!", { interaction });
    logger.verbose(`values selected: [${interaction.values}]`);

    // Show user that select menu is loading
    await interaction.deferUpdate().catch((error: unknown) => {
      logger.error(error);
    });

    const client = await Client.get();

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
              value: command.builder.description,
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
      case `${client.config.name}-audio-queue-select-menu`: {
        const [pageStr] = interaction.values;

        if (!interaction.guildId) throw new ReferenceError("Could not retrieve guildId from interaction");
        const queue = useQueue<QueueMetadata>(interaction.guildId);
        if (!queue) throw new Error("Could not get queue");

        switch (fromKebabString(pageStr)) {
          case QueuePageState.NowPlaying: {
            await queue.metadata.showNowPlaying();
            break;
          }
          case QueuePageState.Queue: {
            if (pageStr.includes("-")) {
              const queuePageNum = parseInt(pageStr.split("-")[1]);
              await queue.metadata.showQueue(queuePageNum);
            } else {
              await queue.metadata.showQueue();
            }

            break;
          }
        }

        break;
      }

      default: {
        logger.error(new ReferenceError("Could not match customId of select menu to one of this bot's!"));
      }
    }
  }
});
