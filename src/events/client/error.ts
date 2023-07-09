import { ClientEvent } from "../../structures/Event";
import logger from "../../logger";

export = new ClientEvent("error", (error) => {
  logger.error(error);
});
