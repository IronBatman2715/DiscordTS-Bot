import assertQueueData from "../../functions/music/assertQueueData";
import { MusicPlayerEvent } from "../../structures/Event";
import logger from "../../logger";

export = new MusicPlayerEvent("queueEnd", async (queue) => {
  assertQueueData(queue);

  logger.verbose("DMP.PlayerEvents:queueEnd => Queue ended!");

  await queue.data.deleteEmbedMessage();
});
