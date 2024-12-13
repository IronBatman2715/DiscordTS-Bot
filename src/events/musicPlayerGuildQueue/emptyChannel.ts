import assertQueueData from "../../functions/music/assertQueueData.js";
import { MusicPlayerGuildQueueEvent } from "../../structures/Event.js";
import logger from "../../structures/Logger.js";

export default new MusicPlayerGuildQueueEvent("emptyChannel", async (queue) => {
  assertQueueData(queue);

  logger.verbose("Empty voice channel! Deleting embed message");
  await queue.metadata.deleteEmbedMessage();
});
