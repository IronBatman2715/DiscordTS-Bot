import { MusicPlayerEvent } from "../../structures/Event";
import QueueWithData from "../../interfaces/QueueWithData";
import logger from "../../logger";

export = new MusicPlayerEvent("error", async (client, error, baseQueue) => {
  logger.error(new Error(`${error} in ${baseQueue.guild.name}!`));

  const queue = baseQueue as QueueWithData;

  await queue.data.latestInteraction.followUp({ content: `Discord music player errored! Error message: ${error}` });
});
