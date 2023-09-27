import type { CacheType, ChatInputCommandInteraction, Message, TextBasedChannel } from "discord.js";
import type { Track } from "discord-player";

import type Client from "./Client";
import logger from "../logger";

export default class QueueData {
  latestInteraction: ChatInputCommandInteraction<CacheType>;
  private _embedMessage?: Message<boolean>;
  readonly client: Client;
  readonly initialInteraction: ChatInputCommandInteraction<CacheType>;
  readonly musicTextChannel: TextBasedChannel;

  constructor(client: Client, initialInteraction: ChatInputCommandInteraction<CacheType>) {
    logger.verbose("Initializing queue data");
    this.client = client;

    if (initialInteraction.channel === null) throw new ReferenceError("Interaction not made in a text channel..?");
    this.musicTextChannel = initialInteraction.channel;

    this.initialInteraction = initialInteraction;
    this.latestInteraction = initialInteraction;
  }

  get embedMessage() {
    if (this._embedMessage === undefined) {
      throw new ReferenceError("Tried to get an embed message that was not yet set!");
    }

    return this._embedMessage;
  }

  private set embedMessage(newEmbedMessage: Message<boolean>) {
    this._embedMessage = newEmbedMessage;
  }

  async updateNowPlaying(track: Track) {
    logger.verbose("Update now playing embed message");

    // Create now playing embed
    const nowPlayingEmbed = this.client.genEmbed({
      title: track.title,
      url: track.url,
      author: {
        name: track.requestedBy?.username || "unassigned",
        iconURL: track.requestedBy?.avatarURL() || "",
      },
      fields: [
        {
          name: "Channel/Artist",
          value: track.author,
          inline: true,
        },
        {
          name: "Duration",
          value: track.duration,
          inline: true,
        },
      ],
      thumbnail: {
        url: track.thumbnail,
      },
    });

    try {
      // Send/update and save embed as message
      const newEmbedMessage = await this.latestInteraction.followUp({
        embeds: [nowPlayingEmbed],
      });

      this.setEmbedMessage(newEmbedMessage);
    } catch (error) {
      logger.error(error);
      logger.error(new Error("Errored trying to send/update now playing embed message!"));
    }
  }

  private async setEmbedMessage(newEmbedMessage: Message<boolean>) {
    if (newEmbedMessage.embeds.length !== 1) {
      throw new ReferenceError(
        `newEmbedMessage has ${newEmbedMessage.embeds.length === 0 ? "no embeds!" : "more than one embed!"}`
      );
    }

    await this.deleteEmbedMessage();

    this.embedMessage = newEmbedMessage;
  }

  async deleteEmbedMessage() {
    try {
      if (this._embedMessage !== undefined) {
        logger.verbose("Deleting QueueData embed message.");
        await this.embedMessage.delete();
      } else {
        logger.verbose("Can NOT delete embed message as one has not been created yet! Skipping deletion attempt.");
      }
    } catch (error) {
      logger.error(error);
      logger.error(new ReferenceError("Could not delete embed message!"));
    }
  }
}
