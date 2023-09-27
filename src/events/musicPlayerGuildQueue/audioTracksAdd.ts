import { MusicPlayerGuildQueueEvent } from "../../structures/Event";
import logger from "../../logger";
import assertQueueData from "../../functions/music/assertQueueData";

export = new MusicPlayerGuildQueueEvent("audioTracksAdd", async (queue, tracks) => {
  assertQueueData(queue);

  logger.verbose(`Added ${tracks.length} audio tracks to the queue. (Use \`/queue\` to inspect which ones)`);
});
