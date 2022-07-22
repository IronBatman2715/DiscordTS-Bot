import assertQueueData from "../../functions/music/assertQueueData";
import { MusicPlayerEvent } from "../../structures/Event";
import logger from "../../logger";

export = new MusicPlayerEvent("playlistAdd", async (client, queue, playlist) => {
  assertQueueData(queue);

  const requestedBy = playlist.songs[0].requestedBy?.username || "UNKNOWN";

  logger.verbose(`${requestedBy} added this playlist to the queue:\n\t${playlist.name}`);

  // Confirmation message
  await queue.data.latestInteraction.followUp({ content: `Queued playlist \`${playlist.name}\`!` });
});
