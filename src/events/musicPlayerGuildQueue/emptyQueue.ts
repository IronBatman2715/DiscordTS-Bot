import assertQueueData from "../../functions/music/assertQueueData";
import logger from "../../logger";
import { MusicPlayerGuildQueueEvent } from "../../structures/Event";

export = new MusicPlayerGuildQueueEvent("emptyQueue", async (queue) => {
  assertQueueData(queue);

  logger.verbose("Empty queue! Deleting embed message");
  await queue.metadata.deleteEmbedMessage();
});
