import { MusicPlayerGuildQueueEvent } from "../../structures/Event.js";
import logger from "../../structures/Logger.js";

export default new MusicPlayerGuildQueueEvent("emptyQueue", async (queue) => {
  logger.verbose("Empty queue! Deleting embed message");
  await queue.metadata.deleteEmbedMessage();
});
