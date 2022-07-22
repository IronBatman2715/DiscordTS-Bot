import type { Queue } from "discord-music-player";

import logger from "../../logger";
import type QueueData from "../../structures/QueueData";

export interface QueueWithData extends Queue<QueueData> {
  data: QueueData;
  setData: (data: QueueData) => void;
}

export default function _(queue: Queue<unknown>): asserts queue is QueueWithData {
  if (!queue.data) logger.error(new ReferenceError("Could not read Queue data structure!"));
}
