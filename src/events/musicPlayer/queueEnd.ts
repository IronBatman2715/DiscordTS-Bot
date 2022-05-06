import { MusicPlayerEvent } from "../../structures/Event";
import type QueueWithData from "../../interfaces/QueueWithData";
import logger from "../../logger";

export = new MusicPlayerEvent("queueEnd", async (client, baseQueue) => {
  const queue = baseQueue as QueueWithData;

  logger.verbose("DMP.PlayerEvents:queueEnd => Queue ended!");

  await queue.data.deleteEmbedMessage();
});
