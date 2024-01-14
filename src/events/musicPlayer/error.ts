import logger from "../../logger";
import { MusicPlayerEvent } from "../../structures/Event";

export = new MusicPlayerEvent("error", async (error) => {
  logger.error(error);
});
