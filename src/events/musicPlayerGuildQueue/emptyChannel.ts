import assertQueueData from "../../functions/music/assertQueueData";
import logger from "../../logger";
import { MusicPlayerGuildQueueEvent } from "../../structures/Event";

export = new MusicPlayerGuildQueueEvent("emptyChannel", async (queue) => {
  assertQueueData(queue);

  logger.verbose("Empty voice channel! Deleting embed message");
  await queue.metadata.deleteEmbedMessage();
});
