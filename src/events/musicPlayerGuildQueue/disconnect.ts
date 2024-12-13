import assertQueueData from "../../functions/music/assertQueueData.js";
import { MusicPlayerGuildQueueEvent } from "../../structures/Event.js";
import logger from "../../structures/Logger.js";

export default new MusicPlayerGuildQueueEvent("disconnect", async (queue) => {
  assertQueueData(queue);

  logger.verbose("Bot disconnected from voice channel");
  if (!queue.isEmpty()) {
    logger.verbose("Deleting embed message");
    await queue.metadata.deleteEmbedMessage();
  }
});
