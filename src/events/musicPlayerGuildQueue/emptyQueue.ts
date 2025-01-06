import logger from "../../logger.js";
import { MusicPlayerGuildQueueEvent } from "../../structures/Event.js";

export default new MusicPlayerGuildQueueEvent("emptyQueue", async (queue) => {
  logger.verbose("Empty queue! Deleting embed message");
  await queue.metadata.deleteEmbedMessage();
});
