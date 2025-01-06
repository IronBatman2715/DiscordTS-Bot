import logger from "../../logger.js";
import { ClientEvent } from "../../structures/Event.js";

export default new ClientEvent("error", (error) => {
  logger.error(error);
});
