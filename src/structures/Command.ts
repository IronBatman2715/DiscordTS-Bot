import type { Awaitable, ChatInputCommandInteraction, SharedSlashCommand } from "discord.js";

import Client from "./Client.js";

type RunFunction = (client: Client, interaction: ChatInputCommandInteraction) => Awaitable<unknown>;

type Builder = SharedSlashCommand;

export default class Command {
  private _category: string;
  private _hasCategory: boolean;
  readonly builder: Builder;
  readonly run: RunFunction;

  constructor(builder: Builder, run: RunFunction) {
    this._category = "";
    this._hasCategory = false;

    this.builder = builder;
    this.run = run;
  }

  get category() {
    return this._category;
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
