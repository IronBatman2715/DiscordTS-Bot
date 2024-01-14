import assertQueueData from "../../functions/music/assertQueueData";
import { MusicPlayerGuildQueueEvent } from "../../structures/Event";
import logger from "../../structures/Logger";

export = new MusicPlayerGuildQueueEvent("emptyChannel", async (queue) => {
  assertQueueData(queue);

  logger.verbose("Empty voice channel! Deleting embed message");
  await queue.metadata.deleteEmbedMessage();
});
