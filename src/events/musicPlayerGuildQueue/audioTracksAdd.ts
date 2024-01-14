import assertQueueData from "../../functions/music/assertQueueData";
import logger from "../../logger";
import { MusicPlayerGuildQueueEvent } from "../../structures/Event";

export = new MusicPlayerGuildQueueEvent("audioTracksAdd", async (queue, tracks) => {
  assertQueueData(queue);

  logger.verbose(`Added ${tracks.length} audio tracks to the queue. (Use \`/queue\` to inspect which ones)`);
});
