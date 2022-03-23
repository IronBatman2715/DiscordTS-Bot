import { MusicPlayerEvent } from "../../structures/Event";
import QueueWithData from "../../interfaces/QueueWithData";

export = new MusicPlayerEvent("queueDestroyed", async (client, baseQueue) => {
  const queue = baseQueue as QueueWithData;

  //console.log("DMP.PlayerEvents:queueDestroyed => Queue destroyed!");

  await queue.data.deleteEmbedMessage();
});
