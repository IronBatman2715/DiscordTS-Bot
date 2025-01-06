import logger from "../../logger.js";
import { MusicPlayerGuildQueueEvent } from "../../structures/Event.js";

export default new MusicPlayerGuildQueueEvent("error", async (queue, error) => {
  // Emitted when the player queue encounters error
  logger.error(`Music Player Guild Queue error: ${error.message}`, queue.id, queue.guild.id);

  logger.error(new Error(`${error}!`));

  await queue.metadata.latestInteraction.followUp({
    content: `Discord music player errored! Error message: "${error}"`,
  });
});
