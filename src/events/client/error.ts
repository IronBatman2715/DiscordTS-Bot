import { ClientEvent } from "../../structures/Event";
import logger from "../../structures/Logger";

export = new ClientEvent("error", (error) => {
  logger.error(error);
});
