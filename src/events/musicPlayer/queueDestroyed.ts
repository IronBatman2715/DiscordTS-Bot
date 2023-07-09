import assertQueueData from "../../functions/music/assertQueueData";
import { MusicPlayerEvent } from "../../structures/Event";
import logger from "../../logger";

export = new MusicPlayerEvent("queueDestroyed", async (queue) => {
  assertQueueData(queue);

  logger.verbose("DMP.PlayerEvents:queueDestroyed => Queue destroyed!");

  await queue.data.deleteEmbedMessage();
});
