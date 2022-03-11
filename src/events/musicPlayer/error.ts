import { MusicPlayerEvent } from "../../structures/Event";

export = new MusicPlayerEvent("error", (client, error, baseQueue) => {
	console.error(`Error: ${error} in ${baseQueue.guild.name}!`);
});
