import { MusicPlayerGuildQueueEvent } from "../../structures/Event.js";
import logger from "../../structures/Logger.js";

export default new MusicPlayerGuildQueueEvent("audioTracksAdd", (_queue, tracks) => {
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  logger.verbose(`Added ${tracks.length} audio tracks to the queue. (Use \`/queue\` to inspect which ones)`);
});
