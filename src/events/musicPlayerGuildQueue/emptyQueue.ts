import { MusicPlayerGuildQueueEvent } from "../../structures/Event";
import logger from "../../logger";
import assertQueueData from "../../functions/music/assertQueueData";

export = new MusicPlayerGuildQueueEvent("emptyQueue", async (queue) => {
  assertQueueData(queue);

  logger.verbose("Empty queue! Deleting embed message");
  await queue.metadata.deleteEmbedMessage();
});
