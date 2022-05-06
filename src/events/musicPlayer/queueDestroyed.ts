import { MusicPlayerEvent } from "../../structures/Event";
import type QueueWithData from "../../interfaces/QueueWithData";
import logger from "../../logger";

export = new MusicPlayerEvent("queueDestroyed", async (client, baseQueue) => {
  const queue = baseQueue as QueueWithData;

  logger.verbose("DMP.PlayerEvents:queueDestroyed => Queue destroyed!");

  await queue.data.deleteEmbedMessage();
});
