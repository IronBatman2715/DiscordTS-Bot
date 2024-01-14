import { MusicPlayerGuildQueueEvent } from "../../structures/Event";
import logger from "../../structures/Logger";

export = new MusicPlayerGuildQueueEvent("debug", async (queue, message) => {
  logger.debug(`Music Player Guild Queue debug (Guild ID: ${queue.guild.id}): ${message}`);
});
