import logger from "../../logger.js";
import { MusicPlayerGuildQueueEvent } from "../../structures/Event.js";

export default new MusicPlayerGuildQueueEvent("debug", (queue, message) => {
  logger.debug(`Music Player Guild Queue debug (Guild ID: ${queue.guild.id}): ${message}`);
});
