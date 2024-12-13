import { MusicPlayerEvent } from "../../structures/Event.js";
import logger from "../../structures/Logger.js";

export default new MusicPlayerEvent("debug", (message) => {
  logger.debug(`Music Player debug: ${message}`);
});
