import type { Awaitable, ChatInputCommandInteraction, SharedSlashCommand } from "discord.js";

import Client from "./Client.js";

type RunFunction = (client: Client, interaction: ChatInputCommandInteraction) => Awaitable<unknown>;

type Builder = SharedSlashCommand;

export function isCommand(input: unknown): input is Command {
  return (
    input instanceof Object &&
    "_category" in input &&
    (typeof input._category === "string" || typeof input._category === "undefined") &&
    "_hasCategory" in input &&
    typeof input._hasCategory === "boolean" &&
    "builder" in input &&
    // input.builder instanceof Builder &&
    "run" in input &&
    input.run instanceof Function
    // TODO: type guard for function signature
  );
}

export default class Command {
  private _category?: string;
  private _hasCategory = false;
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
    if (this._hasCategory) {
      throw new TypeError("Command: category has already been set!");
    } else {
      this._category = category;
      this._hasCategory = true;
    }
  }
}
