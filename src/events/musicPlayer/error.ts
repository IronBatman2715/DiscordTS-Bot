import { MusicPlayerEvent } from "../../structures/Event";
import logger from "../../logger";

export = new MusicPlayerEvent("error", async (error) => {
  logger.error(error);
});
