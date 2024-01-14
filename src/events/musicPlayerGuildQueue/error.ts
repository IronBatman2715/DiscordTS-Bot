import assertQueueData from "../../functions/music/assertQueueData";
import { MusicPlayerGuildQueueEvent } from "../../structures/Event";
import logger from "../../structures/Logger";

export = new MusicPlayerGuildQueueEvent("error", async (queue, error) => {
  assertQueueData(queue);

  // Emitted when the player queue encounters error
  logger.error(`Music Player Guild Queue error: ${error.message}`, queue.id, queue.guild.id);

  logger.error(new Error(`${error}!`));

  await queue.metadata.latestInteraction.followUp({
    content: `Discord music player errored! Error message: "${error}"`,
  });
});
