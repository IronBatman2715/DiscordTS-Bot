import logger from "../../logger";
import { MusicPlayerEvent } from "../../structures/Event";

export = new MusicPlayerEvent("debug", async (message) => {
  logger.debug(`Music Player debug: ${message}`);
});
