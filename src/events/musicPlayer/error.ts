import { MusicPlayerEvent } from "../../structures/Event";
import logger from "../../structures/Logger";

export = new MusicPlayerEvent("error", async (error) => {
  logger.error(error);
});
