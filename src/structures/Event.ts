import type { ClientEvents } from "discord.js";
import type { Prisma } from "@prisma/client";
import type { PlayerEvents } from "discord-music-player";

import type Client from "./Client";

/* --- BaseEvent --- */
export interface IBaseEvent {
  event: string;
  //eslint-disable-next-line @typescript-eslint/ban-types
  run: Function;
  bindToEventEmitter(client: Client): void;
}

/* --- Client --- */
type ClientRunFunction<Ev extends keyof ClientEvents> = {
  (client: Client, ...args: ClientEvents[Ev]);
};

export class ClientEvent<Ev extends keyof ClientEvents> implements IBaseEvent {
  readonly event: Ev;
  readonly run: ClientRunFunction<Ev>;

  constructor(event: Ev, run: ClientRunFunction<Ev>) {
    this.event = event;
    this.run = run;
  }

  bindToEventEmitter(client: Client) {
    client.on(this.event, this.run.bind(null, client));
  }
}

/* --- Prisma --- */
export type PrismaEvents = Prisma.LogLevel;

/** Omit params and duration for MongoDB, as they
 *  {@link https://www.prisma.io/docs/reference/api-reference/prisma-client-reference#event-types will be undefined} */
export type PrismaRunFunction<Ev extends PrismaEvents> = {
  (client: Client, event: Ev extends "query" ? Omit<Prisma.QueryEvent, "params" | "duration"> : Prisma.LogEvent);
};

export class PrismaEvent<Ev extends PrismaEvents> implements IBaseEvent {
  readonly event: Ev;
  readonly run: PrismaRunFunction<Ev>;

  constructor(event: Ev, run: PrismaRunFunction<Ev>) {
    this.event = event;
    this.run = run;
  }

  bindToEventEmitter(client: Client) {
    client.DB.bindEvent<Ev>(this.event, this.run);
  }
}

/* --- Music Player --- */
type MusicPlayerRunFunction<Ev extends keyof PlayerEvents> = {
  (client: Client, ...args: PlayerEvents[Ev]);
};

export class MusicPlayerEvent<Ev extends keyof PlayerEvents> implements IBaseEvent {
  readonly event: Ev;
  readonly run: MusicPlayerRunFunction<Ev>;

  constructor(event: Ev, run: MusicPlayerRunFunction<Ev>) {
    this.event = event;
    this.run = run;
  }

  bindToEventEmitter(client: Client) {
    client.player.on(this.event, this.run.bind(null, client));
  }
}

/* --- Export --- */
export default IBaseEvent;
