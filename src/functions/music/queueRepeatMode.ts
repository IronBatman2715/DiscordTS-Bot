import { QueueRepeatMode } from "discord-player";

import { isInRange } from "../general/math.js";

export function isQueueRepeatMode(i: number): i is QueueRepeatMode {
  return Number.isInteger(i) && isInRange(i, 0, 3);
}

export function toDisplayString(value: QueueRepeatMode): string {
  switch (value) {
    case 0:
      return "OFF";
    case 1:
      return "TRACK";
    case 2:
      return "QUEUE";
    case 3:
      return "AUTOPLAY";
  }
}
