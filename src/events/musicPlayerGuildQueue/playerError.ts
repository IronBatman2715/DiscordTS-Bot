import { MusicPlayerGuildQueueEvent } from "../../structures/Event.js";
import logger from "../../structures/Logger.js";

export default new MusicPlayerGuildQueueEvent("playerError", (queue, error) => {
  // Emitted when the audio player errors while streaming audio track
  logger.error(new Error(`Music Player error: Guild Queue (id: ${queue.id}) ${error.message}`));
});
