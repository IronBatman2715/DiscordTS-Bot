import tempMessage from "../../functions/discord/tempMessage.js";
import logger from "../../logger.js";
import { MusicPlayerGuildQueueEvent } from "../../structures/Event.js";

export default new MusicPlayerGuildQueueEvent("audioTrackAdd", async (queue, track) => {
  logger.verbose(
    `${track.requestedBy?.displayName ?? "USER_DISPLAY_NAME"} added this audio track to the queue:\n\t${track.title}`
  );

  if (queue.isPlaying()) {
    logger.verbose("Queue is playing, sending confirmation message");

    await queue.metadata.update(queue);
    await tempMessage(queue.metadata.latestInteraction, `Queued [${track.title}](${track.url}) by ${track.author}!`);
  } else {
    logger.verbose("Queue has just begun, NOT sending a redundant confirmation message");
  }
});
