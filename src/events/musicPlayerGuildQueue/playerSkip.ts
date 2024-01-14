import assertQueueData from "../../functions/music/assertQueueData";
import { MusicPlayerGuildQueueEvent } from "../../structures/Event";

export = new MusicPlayerGuildQueueEvent("playerSkip", async (queue, track) => {
  assertQueueData(queue);

  await queue.metadata.latestInteraction.followUp(`Skipping \`${track.title}\` due to stream loading failure!`);
});
