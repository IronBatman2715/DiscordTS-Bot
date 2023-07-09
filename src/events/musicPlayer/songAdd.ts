import assertQueueData from "../../functions/music/assertQueueData";
import { MusicPlayerEvent } from "../../structures/Event";
import logger from "../../logger";

export = new MusicPlayerEvent("songAdd", async (queue, song) => {
  assertQueueData(queue);

  logger.verbose(`${song.requestedBy?.username} added this song to the queue:\n\t${song.name}`);

  if (queue.isPlaying) {
    // Confirmation message
    await queue.data.latestInteraction.followUp({ content: `Queued \`${song.name}\`!` });
  }
});
