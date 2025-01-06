import type { Prisma } from "@prisma/client";
import type { GuildQueueEvents, Player, PlayerEvents, PlayerEventsEmitter } from "discord-player";
import type { Awaitable, ClientEvents } from "discord.js";

import { bindEvent as bindDBEvent } from "../database/index.js";
import type Client from "./Client.js";
import QueueMetadata from "./QueueMetadata.js";

/* --- BaseEvent --- */
export enum EventEmitterType {
  Client,
  Prisma,
  MusicPlayer,
  MusicPlayerGuildQueue,
}
export function eventEmitterTypeFromDir(dirName: string): EventEmitterType {
  switch (dirName) {
    case "client": {
      return EventEmitterType.Client;
    }
    case "prisma": {
      return EventEmitterType.Prisma;
    }
    case "musicPlayer": {
      return EventEmitterType.MusicPlayer;
    }
    case "musicPlayerGuildQueue": {
      return EventEmitterType.MusicPlayerGuildQueue;
    }

    default: {
      throw new Error(`Unexpected event type directory: "${dirName}"`);
    }
  }
}

interface IBindEvent<T = null> {
  bindToEventEmitter(arg: T): void;
}

class BaseEvent<Ev extends string, EventRunFunc extends CallableFunction> {
  readonly event: Ev;
  readonly run: EventRunFunc;

  constructor(event: Ev, run: EventRunFunc) {
    this.event = event;
    this.run = run;
  }

  isClient<Ev extends keyof ClientEvents>(): this is ClientEvent<Ev> {
    return this instanceof ClientEvent;
  }

  isMusicPlayer<Ev extends keyof PlayerEvents>(): this is MusicPlayerEvent<Ev> {
    return this instanceof MusicPlayerEvent;
  }

  isMusicPlayerGuildQueue<Ev extends keyof GuildQueueEvents<QueueMetadata>>(): this is MusicPlayerGuildQueueEvent<Ev> {
    return this instanceof MusicPlayerGuildQueueEvent;
  }

  isPrisma<Ev extends PrismaEvents>(): this is PrismaEvent<Ev> {
    return this instanceof PrismaEvent;
  }
}
export function isBaseEvent(input: unknown): input is BaseEvent<string, CallableFunction> {
  return (
    input instanceof Object &&
    "event" in input &&
    typeof input.event === "string" &&
    "run" in input &&
    input.run instanceof Function // generic function, so no more checks
  );
}

/* --- Client --- */
type ClientRunFunction<Ev extends keyof ClientEvents> = (...args: ClientEvents[Ev]) => Awaitable<void>;

export class ClientEvent<Ev extends keyof ClientEvents>
  extends BaseEvent<Ev, ClientRunFunction<Ev>>
  implements IBindEvent<Client>
{
  bindToEventEmitter(eventEmitter: Client): void {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    eventEmitter.on(this.event, this.run);
  }
}

/* --- Music Player --- */
type MusicPlayerRunFunction<Ev extends keyof PlayerEvents> = PlayerEvents[Ev];

export class MusicPlayerEvent<Ev extends keyof PlayerEvents>
  extends BaseEvent<Ev, MusicPlayerRunFunction<Ev>>
  implements IBindEvent<Player>
{
  bindToEventEmitter(eventEmitter: Player): void {
    eventEmitter.on(this.event, this.run);
  }
}

/* --- Music Player Guild Queue --- */
type MusicPlayerGuildQueueRunFunction<Ev extends keyof GuildQueueEvents<QueueMetadata>> =
  GuildQueueEvents<QueueMetadata>[Ev];

export class MusicPlayerGuildQueueEvent<Ev extends keyof GuildQueueEvents<QueueMetadata>>
  extends BaseEvent<Ev, MusicPlayerGuildQueueRunFunction<Ev>>
  implements IBindEvent<PlayerEventsEmitter<GuildQueueEvents<QueueMetadata>>>
{
  bindToEventEmitter(eventEmitter: PlayerEventsEmitter<GuildQueueEvents<QueueMetadata>>): void {
    eventEmitter.on(this.event, this.run);
  }
}

/* --- Prisma --- */
export type PrismaEvents = Prisma.LogLevel;

/** Omit `params` and `duration` for MongoDB, as they
 *  {@link https://www.prisma.io/docs/reference/api-reference/prisma-client-reference#event-types will be undefined}
 */
export type PrismaRunFunction<Ev extends PrismaEvents> = (
  event: Ev extends "query" ? Omit<Prisma.QueryEvent, "params" | "duration"> : Prisma.LogEvent
) => void;

export class PrismaEvent<Ev extends PrismaEvents> extends BaseEvent<Ev, PrismaRunFunction<Ev>> implements IBindEvent {
  bindToEventEmitter(): void {
    bindDBEvent<Ev>(this.event, this.run);
  }
}
