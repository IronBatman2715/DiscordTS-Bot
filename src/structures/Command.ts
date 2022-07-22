import type { CacheType, ChatInputCommandInteraction } from "discord.js";
import type { SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from "@discordjs/builders";

import Client from "./Client";

type RunFunction = {
  (client: Client, interaction: ChatInputCommandInteraction<CacheType>);
};

type Builder = Omit<SlashCommandBuilder, "addSubcommandGroup" | "addSubcommand"> | SlashCommandSubcommandsOnlyBuilder;

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
    if (this.hasCategory) {
      throw new TypeError("Command: category has already been set!");
    } else {
      this._category = category;
      this._hasCategory = true;
    }
  }

  get hasCategory() {
    return this._hasCategory;
  }
}
