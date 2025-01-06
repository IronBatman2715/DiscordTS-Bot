import logger from "../../logger.js";
import { MusicPlayerEvent } from "../../structures/Event.js";

export default new MusicPlayerEvent("debug", (message) => {
  logger.debug(`Music Player debug: ${message}`);
});
