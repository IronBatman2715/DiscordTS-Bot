import assertQueueData from "../../functions/music/assertQueueData";
import { MusicPlayerEvent } from "../../structures/Event";
import logger from "../../logger";

export = new MusicPlayerEvent("error", async (client, error, queue) => {
  logger.error(new Error(`${error} in ${queue.guild.name}!`));
  assertQueueData(queue);

  await queue.data.latestInteraction.followUp({ content: `Discord music player errored! Error message: "${error}"` });
});
