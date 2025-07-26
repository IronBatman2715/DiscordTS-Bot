import tempMessage from "../../functions/discord/tempMessage.js";
import { MusicPlayerGuildQueueEvent } from "../../structures/Event.js";

export default new MusicPlayerGuildQueueEvent("playerSkip", async (queue, track) => {
  await tempMessage(queue.metadata.latestInteraction, `Skipping \`${track.title}\` due to stream loading failure!`);
});
