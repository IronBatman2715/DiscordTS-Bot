import { ClientEvent } from "../../structures/Event";
import logger from "../../logger";

export = new ClientEvent("error", (client, error) => {
  logger.error(error);
});
