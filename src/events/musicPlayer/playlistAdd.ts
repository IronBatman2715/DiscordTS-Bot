import { MusicPlayerEvent } from "../../structures/Event";
import QueueWithData from "../../interfaces/QueueWithData";
import tempMessage from "../../functions/discord/tempMessage";

export = new MusicPlayerEvent("playlistAdd", async (client, baseQueue, playlist) => {
	const queue = baseQueue as QueueWithData;

	/*const requestedBy = playlist.songs[0].requestedBy!.username;

  console.log(`${requestedBy} added this playlist to the queue:\n\t${playlist.name}`);*/

	//Confirmation message
	tempMessage(queue.data.latestInteraction, `Queued playlist \`${playlist.name}\`!`);
});
