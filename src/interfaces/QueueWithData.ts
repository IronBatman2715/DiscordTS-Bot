import type { Queue } from "discord-music-player";

import type QueueData from "../structures/QueueData";

export default interface QueueWithData extends Queue {
  data: QueueData;
  setData: (data: QueueData) => void;
}
