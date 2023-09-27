import { MusicPlayerGuildQueueEvent } from "../../structures/Event";
import logger from "../../logger";
import assertQueueData from "../../functions/music/assertQueueData";

export = new MusicPlayerGuildQueueEvent("emptyChannel", async (queue) => {
  assertQueueData(queue);

  logger.verbose("Empty voice channel! Deleting embed message");
  await queue.metadata.deleteEmbedMessage();
});
