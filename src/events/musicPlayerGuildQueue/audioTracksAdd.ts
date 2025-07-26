import tempMessage from "../../functions/discord/tempMessage.js";
import logger from "../../logger.js";
import { MusicPlayerGuildQueueEvent } from "../../structures/Event.js";

export default new MusicPlayerGuildQueueEvent("audioTracksAdd", async (queue, tracks) => {
  if (queue.isPlaying()) {
    logger.verbose("Queue is playing, sending confirmation message");

    await queue.metadata.update(queue);
    await tempMessage(queue.metadata.latestInteraction, `Added ${tracks.length} audio tracks to the queue`);
  } else {
    logger.verbose("Queue has just begun, NOT sending a redundant confirmation message");
  }
});
