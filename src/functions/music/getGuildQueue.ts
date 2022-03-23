import { CacheType, CommandInteraction } from "discord.js";

import Client from "../../structures/Client";
import QueueData from "../../structures/QueueData";
import QueueWithData from "../../interfaces/QueueWithData";
//import logger from "../general/logger";

/**
 * @param updateLatestInteraction Set to true to override `queue.data.latestInteraction` with `interaction`
 */
export default async (client: Client, interaction: CommandInteraction<CacheType>, updateLatestInteraction = false) => {
  const guildId = interaction.guildId;
  if (typeof guildId !== "string") return;

  //If this server has a music queue already, get it. If not, create with new QueueData
  let guildQueue: QueueWithData;
  if (client.player.hasQueue(guildId)) {
    //console.log("Queue already exists!");
    guildQueue = client.player.getQueue(guildId) as QueueWithData;

    if (updateLatestInteraction) guildQueue.data.latestInteraction = interaction;

    return guildQueue;
  } else {
    //logger("Queue does not exist!");

    //Create new queue ONLY if input interaction is set to be the latest interaction
    if (updateLatestInteraction) {
      //logger(" Making a new queue now!\n");

      guildQueue = client.player.createQueue(guildId, {
        data: new QueueData(client, interaction),
      }) as QueueWithData;

      const { defaultRepeatMode } = await client.DB.getGuildConfig(guildId);
      guildQueue.setRepeatMode(defaultRepeatMode);

      return guildQueue;
    } else {
      //logger("\n");
      await interaction.followUp({
        content: "A queue has not been started yet! Use `/play` or `/playlist` to queue a song.",
      });

      return;
    }
  }
};
