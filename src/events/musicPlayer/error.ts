import logger from "../../logger.js";
import { MusicPlayerEvent } from "../../structures/Event.js";

export default new MusicPlayerEvent("error", (error) => {
  logger.error(error);
});
