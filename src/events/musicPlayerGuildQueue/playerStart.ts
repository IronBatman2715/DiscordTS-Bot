import assertQueueData from "../../functions/music/assertQueueData";
import { MusicPlayerGuildQueueEvent } from "../../structures/Event";
import logger from "../../structures/Logger";

export = new MusicPlayerGuildQueueEvent("playerStart", async (queue, track) => {
  assertQueueData(queue);

  logger.verbose(`Starting new audio track: ${track.title}`);

  queue.metadata.updateNowPlaying(track);
});
