import { MusicPlayerEvent } from "../../structures/Event";
import QueueWithData from "../../interfaces/QueueWithData";

export = new MusicPlayerEvent("songFirst", async (client, baseQueue, song) => {
	const queue = baseQueue as QueueWithData;

	//console.log(`Playing first song in new queue:\n\t${song.name}`);

	queue.data.updateNowPlaying(song);
});
