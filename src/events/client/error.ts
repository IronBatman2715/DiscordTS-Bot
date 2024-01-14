import logger from "../../logger";
import { ClientEvent } from "../../structures/Event";

export = new ClientEvent("error", (error) => {
  logger.error(error);
});
