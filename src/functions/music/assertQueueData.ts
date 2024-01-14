import type { GuildQueue } from "discord-player";

import logger from "../../structures/Logger";
import QueueData from "../../structures/QueueData";

export default function _(queue: GuildQueue<unknown>): asserts queue is GuildQueue<QueueData> {
  if (!(queue.metadata instanceof QueueData))
    logger.error(new ReferenceError("Could not read GuildQueue data structure!"));
}
