import assertQueueData from "../../functions/music/assertQueueData";
import { MusicPlayerEvent } from "../../structures/Event";
import logger from "../../logger";

export = new MusicPlayerEvent("songChanged", async (queue, newSong, oldSong) => {
  assertQueueData(queue);

  if (oldSong === newSong) {
    logger.verbose(`Repeated song:\n\t${oldSong.name}`);
  } else {
    logger.verbose(`Song changed from\n\t${oldSong.name}\n\t\tto\n\t${newSong.name}`);
    queue.data.updateNowPlaying(newSong);
  }
});
