import logger from "../../logger.js";
import { MusicPlayerGuildQueueEvent } from "../../structures/Event.js";

export default new MusicPlayerGuildQueueEvent("disconnect", async (queue) => {
  logger.verbose("Bot disconnected from voice channel");
  if (!queue.isEmpty()) {
    logger.verbose("Deleting embed message");
    await queue.metadata.deleteEmbedMessage();
  }
});
