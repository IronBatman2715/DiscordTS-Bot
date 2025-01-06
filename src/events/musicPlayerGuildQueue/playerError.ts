import logger from "../../logger.js";
import { MusicPlayerGuildQueueEvent } from "../../structures/Event.js";

export default new MusicPlayerGuildQueueEvent("playerError", (queue, error) => {
  // Emitted when the audio player errors while streaming audio track
  logger.error(new Error(`Music Player error: Guild Queue (id: ${queue.id}) ${error.message}`));
});
