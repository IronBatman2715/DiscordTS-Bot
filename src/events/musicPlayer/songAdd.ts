import { MusicPlayerEvent } from "../../structures/Event";
import QueueWithData from "../../interfaces/QueueWithData";
import tempMessage from "../../functions/discord/tempMessage";

export = new MusicPlayerEvent("songAdd", async (client, baseQueue, song) => {
  const queue = baseQueue as QueueWithData;

  //console.log(`${song.requestedBy?.username} added this song to the queue:\n\t${song.name}`);

  if (queue.isPlaying) {
    //Confirmation message
    tempMessage(queue.data.latestInteraction, `Queued \`${song.name}\`!`);
  }
});
