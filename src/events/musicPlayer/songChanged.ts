import { MusicPlayerEvent } from "../../structures/Event";
import QueueWithData from "../../interfaces/QueueWithData";

export = new MusicPlayerEvent("songChanged", async (client, baseQueue, newSong, oldSong) => {
	const queue = baseQueue as QueueWithData;

	if (oldSong == newSong) {
		//console.log(`Repeated song:\n\t${oldSong.name}`);
	} else {
		//console.log(`Song changed from\n\t${oldSong.name}\n\t\tto\n\t${newSong.name}`);
		queue.data.updateNowPlaying(newSong);
	}
});
