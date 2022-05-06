import { MusicPlayerEvent } from "../../structures/Event";
import type QueueWithData from "../../interfaces/QueueWithData";
import logger from "../../logger";

export = new MusicPlayerEvent("songFirst", async (client, baseQueue, song) => {
  const queue = baseQueue as QueueWithData;

  logger.verbose(`Playing first song in new queue:\n\t${song.name}`);

  queue.data.updateNowPlaying(song);
});
