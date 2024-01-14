import assertQueueData from "../../functions/music/assertQueueData";
import logger from "../../logger";
import { MusicPlayerGuildQueueEvent } from "../../structures/Event";

export = new MusicPlayerGuildQueueEvent("error", async (queue, error) => {
  assertQueueData(queue);

  // Emitted when the player queue encounters error
  logger.error(`Music Player Guild Queue error: ${error.message}`, queue.id, queue.guild.id);

  logger.error(new Error(`${error}!`));

  await queue.metadata.latestInteraction.followUp({
    content: `Discord music player errored! Error message: "${error}"`,
  });
});
