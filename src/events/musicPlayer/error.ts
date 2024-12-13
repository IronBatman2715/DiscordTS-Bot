import { MusicPlayerEvent } from "../../structures/Event.js";
import logger from "../../structures/Logger.js";

export default new MusicPlayerEvent("error", (error) => {
  logger.error(error);
});
