import { RepeatMode } from "discord-music-player";
import { model, Schema } from "mongoose";
import type { Document, Model } from "mongoose";

export type GuildConfig = {
  guildId: string;
  greetings: string[];
  maxMessagesCleared: number;
  musicChannelId: string;
  defaultRepeatMode: RepeatMode;
};

export const guildConfigDefaults: Omit<GuildConfig, "guildId"> = {
  greetings: [
    "Hello!",
    "Hello there!",
    "How are you!",
    "Howdy!",
    "What's up chief?",
    "Greetings",
    "What's cracka-lackin?!",
    "Sup bro",
    "What's up boss?",
    "Ah, hello human",
  ],
  maxMessagesCleared: 100,
  musicChannelId: "",
  defaultRepeatMode: RepeatMode.DISABLED,
};

export const guildConfigDescriptions = {
  greetings: "List of greetings that the bot can send.",
  maxMessagesCleared: "Maximum number of messages `/clear` can delete in one command call.",
  musicChannelId: "If specified, ALL music commands MUST be entered in this text channel!",
  defaultRepeatMode: "Default repeat mode of music player.",
};

interface IGuildConfig extends Document, GuildConfig {}

export const GuildConfigModel: Model<IGuildConfig> = model(
  "GuildConfig",

  new Schema({
    guildId: {
      type: String,
      required: true,
    },
    greetings: {
      type: [String],
      required: true,
      default: guildConfigDefaults.greetings,
    },
    maxMessagesCleared: {
      type: Number,
      required: true,
      default: guildConfigDefaults.maxMessagesCleared,
    },
    musicChannelId: {
      type: String,
      required: false,
      default: guildConfigDefaults.musicChannelId,
    },
    defaultRepeatMode: {
      type: Number,
      required: true,
      default: guildConfigDefaults.defaultRepeatMode,
    },
  })
);
