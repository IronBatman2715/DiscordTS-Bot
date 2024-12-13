import type { GuildQueue } from "discord-player";

import logger from "../../structures/Logger.js";
import QueueData from "../../structures/QueueData.js";

export default function _(queue: GuildQueue): asserts queue is GuildQueue<QueueData> {
  if (!(queue.metadata instanceof QueueData))
    logger.error(new ReferenceError("Could not read GuildQueue data structure!"));
}
