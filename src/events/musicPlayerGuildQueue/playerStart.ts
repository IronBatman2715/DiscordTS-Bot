import assertQueueData from "../../functions/music/assertQueueData";
import logger from "../../logger";
import { MusicPlayerGuildQueueEvent } from "../../structures/Event";

export = new MusicPlayerGuildQueueEvent("playerStart", async (queue, track) => {
  assertQueueData(queue);

  logger.verbose(`Starting new audio track: ${track.title}`);

  queue.metadata.updateNowPlaying(track);
});
