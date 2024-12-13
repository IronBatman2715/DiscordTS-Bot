import assertQueueData from "../../functions/music/assertQueueData.js";
import { MusicPlayerGuildQueueEvent } from "../../structures/Event.js";
import logger from "../../structures/Logger.js";

export default new MusicPlayerGuildQueueEvent("playerStart", async (queue, track) => {
  assertQueueData(queue);

  logger.verbose(`Starting new audio track: ${track.title}`);

  await queue.metadata.updateNowPlaying(track);
});
