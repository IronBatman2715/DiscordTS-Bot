import { MusicPlayerEvent } from "../../structures/Event";
import type QueueWithData from "../../interfaces/QueueWithData";
import logger from "../../logger";

export = new MusicPlayerEvent("songAdd", async (client, baseQueue, song) => {
  const queue = baseQueue as QueueWithData;

  logger.verbose(`${song.requestedBy?.username} added this song to the queue:\n\t${song.name}`);

  if (queue.isPlaying) {
    //Confirmation message
    await queue.data.latestInteraction.followUp({ content: `Queued \`${song.name}\`!` });
  }
});
