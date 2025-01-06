import logger from "../../logger.js";
import { MusicPlayerGuildQueueEvent } from "../../structures/Event.js";

export default new MusicPlayerGuildQueueEvent("playerStart", async (queue, track) => {
  logger.verbose(`Starting new audio track: ${track.title}`);

  await queue.metadata.updateNowPlaying(track);
});
