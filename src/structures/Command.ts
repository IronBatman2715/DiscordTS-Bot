import type { Awaitable, ChatInputCommandInteraction, SharedSlashCommand } from "discord.js";

import type Client from "./Client.js";

// ChatInputCommandInteraction<"raw" | "cached"> means that ChatInputCommandInteraction.inGuild() is true
export type GuildChatInputCommandInteraction = ChatInputCommandInteraction<"raw" | "cached">;

type RunFunction = (client: Client, interaction: GuildChatInputCommandInteraction) => Awaitable<unknown>;

type Builder = SharedSlashCommand;

export function isCommand(input: unknown): input is Command {
  return (
    input instanceof Object &&
    "_category" in input &&
    (typeof input._category === "string" || typeof input._category === "undefined") &&
    "builder" in input &&
    // input.builder instanceof Builder &&
    "run" in input &&
    input.run instanceof Function
    // TODO: type guard for function signature
  );
}

export default class Command {
  private _category?: string;
  readonly builder: Builder;
  readonly run: RunFunction;

  constructor(builder: Builder, run: RunFunction) {
    this.builder = builder;
    this.run = run;
  }

  get category(): string {
    if (this._category) return this._category;

    throw new TypeError("Command: category has not been set!");
  }

  set category(category: string) {
    if (this._category !== undefined) {
      throw new TypeError("Command: category has already been set!");
    } else {
      this._category = category;
    }
  }
}
