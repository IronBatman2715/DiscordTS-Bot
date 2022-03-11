import { CacheType, CommandInteraction, Message, TextBasedChannel } from "discord.js";
import { Song } from "discord-music-player";

import Client from "./Client";

export default class QueueData {
	latestInteraction: CommandInteraction<CacheType>;
	private _embedMessage?: Message<boolean>;
	readonly client: Client;
	readonly initialInteraction: CommandInteraction<CacheType>;
	readonly musicTextChannel: TextBasedChannel;

	constructor(client: Client, initialInteraction: CommandInteraction<CacheType>) {
		this.client = client;

		if (initialInteraction.channel === null) throw "Interaction not made in a text channel..?";
		this.musicTextChannel = initialInteraction.channel;

		this.initialInteraction = initialInteraction;
		this.latestInteraction = initialInteraction;
	}

	get embedMessage() {
		if (this._embedMessage === undefined) {
			throw "Tried to get an embed message that was not yet set!";
		}

		return this._embedMessage;
	}

	private set embedMessage(newEmbedMessage: Message<boolean>) {
		this._embedMessage = newEmbedMessage;
	}

	async updateNowPlaying(song: Song) {
		//Create now playing embed
		const nowPlayingEmbed = this.client.genEmbed({
			title: "Now playing",
			description: `[${song.name}](${song.url})`,
			author: {
				name: song.requestedBy?.username || "unassigned",
				iconURL: song.requestedBy?.avatarURL({ dynamic: true }) || "",
			},
			thumbnail: {
				url: "attachment://music.png",
			},
		});

		try {
			//Send/update and save embed as message
			const newEmbedMessage = await this.latestInteraction.followUp({
				embeds: [nowPlayingEmbed],
				files: [`${this.client.basePath}/resources/assets/icons/music.png`],
			});

			this.setEmbedMessage(newEmbedMessage as Message<boolean>);
		} catch (error) {
			console.error(error);
		}
	}

	protected async setEmbedMessage(newEmbedMessage: Message<boolean>) {
		if (newEmbedMessage.embeds.length != 1) {
			let str: string;
			switch (newEmbedMessage.embeds.length) {
				case 0: {
					str = "no embeds!";
					break;
				}
				default: {
					str = "more than one embed!";
					break;
				}
			}
			return console.error(`Error => QueueData.setEmbedMessage: newEmbedMessage has ${str}`);
		}

		await this.deleteEmbedMessage();

		this.embedMessage = newEmbedMessage;
		return;
	}

	async deleteEmbedMessage() {
		try {
			if (typeof this.embedMessage !== "undefined") {
				await this.embedMessage.delete();
			} else {
				throw "Can NOT delete embed message! One has not been created yet!";
			}
		} catch (error) {
			console.error(error);
		}
	}
}
