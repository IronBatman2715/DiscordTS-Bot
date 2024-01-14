import assertQueueData from "../../functions/music/assertQueueData";
import { MusicPlayerGuildQueueEvent } from "../../structures/Event";
import logger from "../../structures/Logger";

export = new MusicPlayerGuildQueueEvent("emptyQueue", async (queue) => {
  assertQueueData(queue);

  logger.verbose("Empty queue! Deleting embed message");
  await queue.metadata.deleteEmbedMessage();
});
