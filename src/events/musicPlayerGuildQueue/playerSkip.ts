import { MusicPlayerGuildQueueEvent } from "../../structures/Event.js";

export default new MusicPlayerGuildQueueEvent("playerSkip", async (queue, track) => {
  await queue.metadata.latestInteraction.followUp(`Skipping \`${track.title}\` due to stream loading failure!`);
});
