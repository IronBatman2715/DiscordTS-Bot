import { Queue } from "discord-music-player";

import QueueData from "../structures/QueueData";

export default interface QueueWithData extends Queue {
  data: QueueData;
  setData: (data: QueueData) => void;
}
