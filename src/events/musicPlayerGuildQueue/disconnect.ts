import { MusicPlayerGuildQueueEvent } from "../../structures/Event";
import logger from "../../logger";
import assertQueueData from "../../functions/music/assertQueueData";

export = new MusicPlayerGuildQueueEvent("disconnect", async (queue) => {
  assertQueueData(queue);

  logger.verbose("Bot disconnected from voice channel");
  if (!queue.isEmpty()) {
    logger.verbose("Deleting embed message");
    await queue.metadata.deleteEmbedMessage();
  }
});
