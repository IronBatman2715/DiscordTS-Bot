import { ExcludeEnum } from "discord.js";
import { ActivityTypes } from "discord.js/typings/enums";

export type ActivitiesOptions = {
  name: string;
  type: ExcludeEnum<typeof ActivityTypes, "CUSTOM">;
  url?: string;
};

export type BotConfig = {
  name: string;
  version: string;
  activities: ActivitiesOptions[];
};

export const botConfig: BotConfig = {
  name: "Z-Bot",
  version: "1.0.0",
  activities: [
    {
      type: ActivityTypes.PLAYING,
      name: " Squid Game",
    },
    {
      type: ActivityTypes.LISTENING,
      name: " Never Gonna Give you Up",
    },
    {
      type: ActivityTypes.WATCHING,
      name: " Dota 2 Reporter",
    },
    {
      type: ActivityTypes.COMPETING,
      name: " TI",
    },
    {
      type: ActivityTypes.PLAYING,
      name: " Tech Expansion",
    },
    {
      type: ActivityTypes.PLAYING,
      name: " Tekkit",
    },
    {
      type: ActivityTypes.PLAYING,
      name: " Pudge",
    },
    {
      type: ActivityTypes.PLAYING,
      name: " MEEPOOO",
    },
    {
      type: ActivityTypes.PLAYING,
      name: " carry Wisp mid",
    },
    {
      type: ActivityTypes.PLAYING,
      name: " in vault 666",
    },
    {
      type: ActivityTypes.WATCHING,
      name: " Gandhi nuke everyone",
    },
    {
      type: ActivityTypes.WATCHING,
      name: " The Fellowship of the Ring",
    },
    {
      type: ActivityTypes.WATCHING,
      name: " Two Towers",
    },
    {
      type: ActivityTypes.WATCHING,
      name: " Return of the King",
    },
    {
      type: ActivityTypes.LISTENING,
      name: " The Longest Johns",
    },
    {
      type: ActivityTypes.LISTENING,
      name: " Stan Rogers",
    },
    {
      type: ActivityTypes.LISTENING,
      name: " T-Swizzle",
    },
    {
      type: ActivityTypes.PLAYING,
      name: " Connect Four",
    },
    {
      type: ActivityTypes.PLAYING,
      name: " Monopoly City",
    },
  ],
};

export default botConfig;
