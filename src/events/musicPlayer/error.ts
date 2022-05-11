import { MusicPlayerEvent } from "../../structures/Event";
import logger from "../../logger";

export = new MusicPlayerEvent("error", (client, error, baseQueue) => {
  logger.error(new Error(`${error} in ${baseQueue.guild.name}!`));
});
