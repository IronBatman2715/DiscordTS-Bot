import type { EmbedField, Message } from "discord.js";
import {
  ActionRowBuilder,
  DiscordAPIError,
  GuildMember,
  RESTJSONErrorCodes,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";
import type { GuildQueue } from "discord-player";
import { useMainPlayer, useQueue } from "discord-player";
import lodash from "lodash";

import { getGuildConfig } from "../database/GuildConfig.js";
import tempMessage from "../functions/discord/tempMessage.js";
import { toDisplayString } from "../functions/music/queuePageState.js";
import {
  isQueueRepeatMode,
  toDisplayString as queueRepeatModeToDisplayString,
} from "../functions/music/queueRepeatMode.js";
import logger from "../logger.js";
import Client from "./Client.js";
import type { GuildChatInputCommandInteraction } from "./Command.js";

const { kebabCase } = lodash;

export enum QueuePageState {
  NowPlaying = 0,
  Queue = 1,
}

const MAX_TRACKS_PER_QUEUE_EMBED = 5;

export default class QueueMetadata {
  private stateMessage?: Message;
  private _state: QueuePageState;
  private _statePage?: number;
  private _latestInteraction: GuildChatInputCommandInteraction;

  private client: Client;

  private constructor(client: Client, interaction: GuildChatInputCommandInteraction) {
    this._state = QueuePageState.NowPlaying;
    this._latestInteraction = interaction;

    this.client = client;
  }

  get state() {
    return this._state;
  }

  private set state(state: QueuePageState) {
    this._state = state;
  }

  get latestInteraction() {
    return this._latestInteraction;
  }

  private set latestInteraction(interaction: GuildChatInputCommandInteraction) {
    this._latestInteraction = interaction;
  }

  static async playQuery(interaction: GuildChatInputCommandInteraction, query: string): Promise<boolean> {
    const client = await Client.get();

    if (interaction.channel === null) throw new ReferenceError("Interaction not made in a text channel..?");

    if (!(interaction.member instanceof GuildMember))
      throw new TypeError("Expected `interaction.member` to be of type `GuildMember`");

    // Check if user is currently in a voice channel
    if (!interaction.member.voice.channel) {
      await tempMessage(interaction, "Join a voice channel first!");
      return false;
    }

    const player = useMainPlayer();
    const searchResult = await player.search(query, {
      requestedBy: interaction.user,
    });

    if (searchResult.isEmpty()) {
      await tempMessage(interaction, `Could not get a definitive link from "${query}"! Try adding more details.`);
      return false;
    }

    const queue = useQueue<QueueMetadata>(interaction.guildId);
    if (!queue) {
      logger.info("Player is creating a new GuildQueue");

      const { defaultRepeatMode } = await getGuildConfig(interaction.guildId);
      if (!isQueueRepeatMode(defaultRepeatMode)) {
        throw new TypeError(`Invalid default QueueRepeatMode value in database: "${defaultRepeatMode}"`);
      }

      await player.play(interaction.member.voice.channel, searchResult, {
        nodeOptions: {
          leaveOnEmpty: true,
          leaveOnEnd: true,
          leaveOnStop: true,
          metadata: new QueueMetadata(client, interaction),
          repeatMode: defaultRepeatMode,
          selfDeaf: true,
        },
        requestedBy: interaction.user,
      });

      return true;
    } else {
      logger.info("Player is using pre-existing GuildQueue");

      await player.play(interaction.member.voice.channel, searchResult, {
        requestedBy: interaction.user,
      });

      return false;
    }
  }

  async showNowPlaying() {
    this.state = QueuePageState.NowPlaying;
    this._statePage = undefined;

    const nowPlayingEmbed = this.generateNowPlayingEmbed();

    await this.latestInteraction.editReply({
      embeds: [nowPlayingEmbed],
      files: [],
    });
  }

  async showQueue(pageNumber: number | null = null) {
    this.state = QueuePageState.Queue;
    this._statePage = pageNumber ?? 0;

    const queueEmbeds = this.generateQueueEmbeds();

    await this.latestInteraction.editReply({
      embeds: [queueEmbeds[this._statePage]],
      files: ["assets/icons/music.png"],
    });
  }

  private generateNowPlayingEmbed() {
    const queue = useQueue<QueueMetadata>(this.latestInteraction.guildId);
    if (!queue) throw new Error("Could not get queue");

    const track = queue.currentTrack;
    if (!track) throw new Error("Could not get current track");

    const nowPlayingEmbed = this.client.genEmbed({
      title: `Now playing: '${track.title}'`,
      url: track.url,
      author: {
        name: track.requestedBy?.displayName ?? "USER_DISPLAY_NAME",
        iconURL: track.requestedBy?.avatarURL() ?? "",
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

    return nowPlayingEmbed;
  }

  private generateQueueEmbeds() {
    const queue = useQueue<QueueMetadata>(this.latestInteraction.guildId);
    if (!queue) throw new Error("Could not get queue");

    const fields: EmbedField[] = [];
    if (queue.currentTrack) {
      const track = queue.currentTrack;

      fields.unshift({
        name: `Now playing: ${track.title}`,
        value: `by: ${track.author}\nurl: ${track.url}\nrequested by: ${track.requestedBy ?? "USER"}\n`,
        inline: false,
      });
    }
    fields.push(
      ...queue.tracks.toArray().map((track, i) => {
        return {
          name: `${i + 1}: ${track.title}`,
          value: `by: ${track.author}\nurl: ${track.url}\nrequested by: ${track.requestedBy ?? "USER"}\n`,
          inline: false,
        };
      })
    );

    const normalizedFields = [];
    for (let i = 0; i < fields.length; i += MAX_TRACKS_PER_QUEUE_EMBED) {
      normalizedFields.push(fields.slice(i, i + MAX_TRACKS_PER_QUEUE_EMBED));
    }

    return normalizedFields.map((fields) =>
      this.client.genEmbed({
        title: `Music Queue [Repeat mode: ${queueRepeatModeToDisplayString(queue.repeatMode)}]`,
        fields,
        thumbnail: {
          url: "attachment://music.png",
        },
      })
    );
  }

  async update(queue: GuildQueue<QueueMetadata>) {
    // Fetch to ensure it has not been deleted
    logger.debug("Fetching queue state message");
    try {
      this.stateMessage = await this.stateMessage?.fetch();
    } catch (error) {
      if (error instanceof DiscordAPIError && error.code === RESTJSONErrorCodes.UnknownMessage) {
        logger.warn("The message does not exist anymore. Proceeding to re-create");
        this.stateMessage = undefined; // drop message that no longer exists
      } else {
        logger.error("An error occurred while fetching the message:", error);
        throw new Error("Could not update now playing");
      }
    }

    // Generate state options
    const queuePages: string[] = [];
    if (queue.tracks.toArray().length > MAX_TRACKS_PER_QUEUE_EMBED) {
      const startStr = toDisplayString(QueuePageState.Queue);

      const trackCount = queue.tracks.toArray().length;
      const pageCount = Math.ceil(trackCount / MAX_TRACKS_PER_QUEUE_EMBED);
      for (let i = 0; i < pageCount; i++) {
        queuePages.push(`${startStr}: ${i}`);
      }
    } else {
      queuePages.push(toDisplayString(QueuePageState.Queue));
    }
    const options = [toDisplayString(QueuePageState.NowPlaying), ...queuePages].map((v) => {
      return new StringSelectMenuOptionBuilder().setLabel(v).setValue(kebabCase(v));
    });
    const components = [
      new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(
        new StringSelectMenuBuilder()
          .setCustomId(`${this.client.config.name}-audio-queue-select-menu`)
          .setPlaceholder("Select an audio page")
          .setMinValues(1)
          .setMaxValues(1)
          .setOptions(options)
      ),
    ];

    if (this.stateMessage) {
      // Update state message

      logger.debug("Updating queue state message");
      switch (this.state) {
        case QueuePageState.NowPlaying: {
          await this.stateMessage.edit({
            embeds: [this.generateNowPlayingEmbed()],
            components,
            files: [],
          });

          break;
        }

        case QueuePageState.Queue: {
          const queueEmbeds = this.generateQueueEmbeds();

          await this.stateMessage.edit({
            embeds: [queueEmbeds[this._statePage ?? 0]],
            components,
            files: ["assets/icons/music.png"],
          });

          break;
        }
      }
    } else {
      // Create

      // TODO: ensure latestInteraction has not been deleted
      logger.debug("Creating queue state message");

      switch (this.state) {
        case QueuePageState.NowPlaying: {
          this.stateMessage = await this.latestInteraction.followUp({
            embeds: [this.generateNowPlayingEmbed()],
            components,
            files: [],
          });

          break;
        }

        case QueuePageState.Queue: {
          const queueEmbeds = this.generateQueueEmbeds();

          this.stateMessage = await this.latestInteraction.followUp({
            embeds: [queueEmbeds[this._statePage ?? 0]],
            components,
            files: ["assets/icons/music.png"],
          });

          break;
        }
      }
    }
  }

  async close() {
    logger.debug("Deleting queue state message");
    try {
      this.stateMessage = await this.stateMessage?.delete();
      this.stateMessage = undefined;
    } catch (error) {
      if (error instanceof DiscordAPIError && error.code === RESTJSONErrorCodes.UnknownMessage) {
        logger.debug("The message does not exist anymore. Skipping deletion attempt");
        this.stateMessage = undefined;
      } else {
        logger.error("An error occurred while deleting the message:", error);
        throw new Error("Could not delete state message");
      }
    }

    this._statePage = undefined;
  }
}
