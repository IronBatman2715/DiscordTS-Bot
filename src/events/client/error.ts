import { ClientEvent } from "../../structures/Event.js";
import logger from "../../structures/Logger.js";

export default new ClientEvent("error", (error) => {
  logger.error(error);
});
