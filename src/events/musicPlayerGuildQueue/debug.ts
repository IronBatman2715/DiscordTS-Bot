import { MusicPlayerGuildQueueEvent } from "../../structures/Event.js";
import logger from "../../structures/Logger.js";

export default new MusicPlayerGuildQueueEvent("debug", (queue, message) => {
  logger.debug(`Music Player Guild Queue debug (Guild ID: ${queue.guild.id}): ${message}`);
});
