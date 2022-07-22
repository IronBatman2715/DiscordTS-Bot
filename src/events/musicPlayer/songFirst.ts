import assertQueueData from "../../functions/music/assertQueueData";
import { MusicPlayerEvent } from "../../structures/Event";
import logger from "../../logger";

export = new MusicPlayerEvent("songFirst", async (client, queue, song) => {
  assertQueueData(queue);

  logger.verbose(`Playing first song in new queue:\n\t${song.name}`);

  queue.data.updateNowPlaying(song);
});
