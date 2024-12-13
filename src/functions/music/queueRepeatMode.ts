import { QueueRepeatMode } from "discord-player";

import { isInRange } from "../general/math.js";

const queueRepeatModeMap: Record<number, QueueRepeatMode> = {
  [QueueRepeatMode.OFF]: QueueRepeatMode.OFF,
  [QueueRepeatMode.TRACK]: QueueRepeatMode.TRACK,
  [QueueRepeatMode.QUEUE]: QueueRepeatMode.QUEUE,
  [QueueRepeatMode.AUTOPLAY]: QueueRepeatMode.AUTOPLAY,
};

export function indexToEnumVar(i: number): QueueRepeatMode {
  if (Number.isInteger(i) && isInRange(i, 0)) {
    return queueRepeatModeMap[i];
  }

  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  throw new RangeError(`Expected index, received: "${i}"`);
}
