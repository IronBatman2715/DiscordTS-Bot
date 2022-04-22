import { ClientEvents } from "discord.js";
import { PlayerEvents } from "discord-music-player";
import mongoose from "mongoose";

import Client from "./Client";

/* --- BaseEvent --- */
interface IBaseEvent {
  event: string;
  // eslint-disable-next-line @typescript-eslint/ban-types
  run: Function;
  bindToEventEmitter(client: Client): void;
}

/* --- Client --- */
type ClientRunFunction<Ev extends keyof ClientEvents> = {
  (client: Client, ...args: ClientEvents[Ev]);
};

class ClientEvent<Ev extends keyof ClientEvents> implements IBaseEvent {
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

/* --- Mongoose --- */
/** Sourced from {@link https://mongoosejs.com/docs/connections.html#connection-events mongoose website} */
type MongooseEventList = {
  connecting: string;
  connected: string;
  open: string;
  disconnecting: string;
  disconnected: string;
  close: string;
  reconnected: string;
  error: string;
  fullsetup: string;
  all: string;
  reconnectFailed: string;
};

type MongooseRunFunction = {
  (client: Client);
};

class MongooseEvent<Ev extends keyof MongooseEventList> implements IBaseEvent {
  readonly event: Ev;
  readonly run: MongooseRunFunction;

  constructor(event: Ev, run: MongooseRunFunction) {
    this.event = event;
    this.run = run;
  }

  bindToEventEmitter(client: Client) {
    mongoose.connection.on(this.event, this.run.bind(null, client));
  }
}

/* --- Music Player --- */
type MusicPlayerRunFunction<Ev extends keyof PlayerEvents> = {
  (client: Client, ...args: PlayerEvents[Ev]);
};

class MusicPlayerEvent<Ev extends keyof PlayerEvents> implements IBaseEvent {
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
export { IBaseEvent, ClientEvent, MongooseEvent, MusicPlayerEvent };
