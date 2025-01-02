import type { GuildQueue } from "discord-player";

import logger from "../../structures/Logger.js";
import QueueMetadata from "../../structures/QueueMetadata.js";

export default function _(queue: GuildQueue): asserts queue is GuildQueue<QueueMetadata> {
  if (!(queue.metadata instanceof QueueMetadata))
    logger.error(new ReferenceError("Could not read GuildQueue data structure!"));
}
