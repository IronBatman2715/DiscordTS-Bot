import { MusicPlayerEvent } from "../../structures/Event";
import type QueueWithData from "../../interfaces/QueueWithData";
import logger from "../../logger";

export = new MusicPlayerEvent("songChanged", async (client, baseQueue, newSong, oldSong) => {
  const queue = baseQueue as QueueWithData;

  if (oldSong == newSong) {
    logger.verbose(`Repeated song:\n\t${oldSong.name}`);
  } else {
    logger.verbose(`Song changed from\n\t${oldSong.name}\n\t\tto\n\t${newSong.name}`);
    queue.data.updateNowPlaying(newSong);
  }
});
