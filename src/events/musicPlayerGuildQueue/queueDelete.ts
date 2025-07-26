import logger from "../../logger.js";
import { MusicPlayerGuildQueueEvent } from "../../structures/Event.js";

export default new MusicPlayerGuildQueueEvent("queueDelete", async (queue) => {
  logger.verbose("Queue deleted");
  await queue.metadata.close();
});
