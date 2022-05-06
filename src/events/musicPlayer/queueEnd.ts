import { MusicPlayerEvent } from "../../structures/Event";
import type QueueWithData from "../../interfaces/QueueWithData";

export = new MusicPlayerEvent("queueEnd", async (client, baseQueue) => {
  const queue = baseQueue as QueueWithData;

  //console.log("DMP.PlayerEvents:queueEnd => Queue ended!");

  await queue.data.deleteEmbedMessage();
});
