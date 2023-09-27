import { MusicPlayerGuildQueueEvent } from "../../structures/Event";
import logger from "../../logger";
import assertQueueData from "../../functions/music/assertQueueData";
import { MessageFlags } from "discord.js";

export = new MusicPlayerGuildQueueEvent("audioTrackAdd", async (queue, track) => {
  assertQueueData(queue);

  logger.verbose(`${track.requestedBy?.username} added this audio track to the queue:\n\t${track.title}`);

  if (queue.isPlaying()) {
    logger.verbose("Queue is playing, sending confirmation message");

    await queue.metadata.latestInteraction.followUp({
      content: `Queued [${track.title}](${track.url}) by ${track.author}!`,
      flags: MessageFlags.SuppressEmbeds,
    });
  } else {
    logger.verbose("Queue has just begun, NOT sending a redundant confirmation message");
  }
});
