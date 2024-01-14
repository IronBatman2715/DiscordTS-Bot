import logger from "../../logger";
import { MusicPlayerGuildQueueEvent } from "../../structures/Event";

export = new MusicPlayerGuildQueueEvent("playerError", async (queue, error) => {
  // Emitted when the audio player errors while streaming audio track
  logger.error(new Error(`Music Player error: Guild Queue (id: ${queue.id}) ${error.message}`));
});
