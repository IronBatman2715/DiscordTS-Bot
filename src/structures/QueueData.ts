import type { CacheType, CommandInteraction, Message, TextBasedChannel } from "discord.js";
import type { Song } from "discord-music-player";

import type Client from "./Client";

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
      title: song.name,
      url: song.url,
      author: {
        name: song.requestedBy?.username || "unassigned",
        iconURL: song.requestedBy?.avatarURL({ dynamic: true }) || "",
      },
      fields: [
        {
          name: "Channel/Artist",
          value: song.author,
          inline: true,
        },
        {
          name: "Duration",
          value: song.duration,
          inline: true,
        },
      ],
      thumbnail: {
        url: song.thumbnail,
      },
    });

    try {
      //Send/update and save embed as message
      const newEmbedMessage = await this.latestInteraction.followUp({
        embeds: [nowPlayingEmbed],
      });

      this.setEmbedMessage(newEmbedMessage as Message<boolean>);
    } catch (error) {
      console.error(error);
    }
  }

  private async setEmbedMessage(newEmbedMessage: Message<boolean>) {
    if (newEmbedMessage.embeds.length != 1) {
      const str = newEmbedMessage.embeds.length === 0 ? "no embeds!" : "more than one embed!";
      return console.error(`Error => QueueData.setEmbedMessage: newEmbedMessage has ${str}`);
    }

    await this.deleteEmbedMessage();

    this.embedMessage = newEmbedMessage;
    return;
  }

  async deleteEmbedMessage() {
    try {
      if (this._embedMessage !== undefined) {
        await this.embedMessage.delete();
      } else {
        console.log("Can NOT delete embed message as one has not been created yet! Skipping deletion attempt.");
      }
    } catch (error) {
      console.error(error);
    }
  }
}
