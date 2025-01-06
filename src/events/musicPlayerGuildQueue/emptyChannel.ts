import logger from "../../logger.js";
import { MusicPlayerGuildQueueEvent } from "../../structures/Event.js";

export default new MusicPlayerGuildQueueEvent("emptyChannel", async (queue) => {
  logger.verbose("Empty voice channel! Deleting embed message");
  await queue.metadata.deleteEmbedMessage();
});
