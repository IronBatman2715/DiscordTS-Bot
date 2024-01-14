import logger from "../../logger";
import { MusicPlayerGuildQueueEvent } from "../../structures/Event";

export = new MusicPlayerGuildQueueEvent("debug", async (queue, message) => {
  logger.debug(`Music Player Guild Queue debug (Guild ID: ${queue.guild.id}): ${message}`);
});
