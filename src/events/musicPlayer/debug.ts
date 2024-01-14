import { MusicPlayerEvent } from "../../structures/Event";
import logger from "../../structures/Logger";

export = new MusicPlayerEvent("debug", async (message) => {
  logger.debug(`Music Player debug: ${message}`);
});
