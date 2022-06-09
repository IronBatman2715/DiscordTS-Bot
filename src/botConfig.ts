import { existsSync, readFileSync, writeFileSync } from "fs";
import type { ExcludeEnum } from "discord.js";
import { ActivityTypes } from "discord.js/typings/enums";
import Ajv from "ajv";
import type { JSONSchemaType } from "ajv";
import addFormats from "ajv-formats";
import addErrors from "ajv-errors";

export type ActivitiesOptions = {
  /** String after type string */
  name: string;
  /** `0 | 1 | 2 | 3 | 5` */
  type: ExcludeEnum<typeof ActivityTypes, "CUSTOM">;
  /** Only add if `type` is `1 | ActivityTypes.STREAMING` */
  url?: string;
};

export type BotConfig = {
  name: string;
  activities: ActivitiesOptions[];
};

const ajv = new Ajv({ allErrors: true });
addErrors(addFormats(ajv));

const schema: JSONSchemaType<BotConfig> = {
  type: "object",
  properties: {
    name: { type: "string" },
    activities: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          type: {
            type: "integer",
            enum: [0, 1, 2, 3, 5], //ExcludeEnum<typeof ActivityTypes, "CUSTOM">
            errorMessage: {
              enum: "must equal one of the allowed values: 0, 1, 2, 3, or 5",
            },
          },
          url: {
            type: "string",
            format: "uri",
            nullable: true,
            errorMessage: {
              format: "must be a valid uri/url",
            },
          },
        },
        additionalProperties: false,
        required: ["name", "type"],
        errorMessage: {
          additionalProperties: `should not have properties other than "name", "type", and (optionally) "url"`,
          required: {
            name: `should have a string property "name"`,
            type: `should have a integer property "type"`,
          },
        },
      },
      minItems: 1,
      errorMessage: {
        minItems: "should have at least one entry",
      },
    },
  },
  additionalProperties: false,
  required: ["name", "activities"],
  errorMessage: {
    additionalProperties: `should not have properties other than "name", and "activities"`,
    required: {
      name: `should have a string property "name"`,
      activities: `should have a object property "activities"`,
    },
  },
};
const validate = ajv.compile(schema);

/** Load config.json from filesystem or generate it.
 *
 * Can not use logger inside this function as the logger requires the config file!
 */
export function getConfigFile(): BotConfig {
  try {
    if (!existsSync("config.json")) {
      console.info(`Generating "config.json"`);

      try {
        writeFileSync("config.json", JSON.stringify(botConfig, null, "  "));
      } catch (error) {
        throw Error(`Could not generate "config.json"`);
      }

      console.info(`Successfully generated "config.json"\n`);
    }

    const parsedConfigJson = JSON.parse(readFileSync("config.json", "utf-8"));

    if (!validate(parsedConfigJson)) {
      console.error("Error messages for config.json");
      validate.errors?.forEach(({ instancePath, message }) => console.error(`${instancePath} ${message}.`));
      console.log();
      throw new Error("Invalid config file!");
    }

    return parsedConfigJson;
  } catch (error) {
    console.error(error);
    throw new Error("Errored getting config file!");
  }
}

export const botConfig: BotConfig = {
  name: "Z-Bot",
  activities: [
    {
      type: ActivityTypes.PLAYING,
      name: "Squid Game",
    },
    {
      type: ActivityTypes.STREAMING,
      name: "the best",
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    },
    {
      type: ActivityTypes.LISTENING,
      name: "Never Gonna Give you Up",
    },
    {
      type: ActivityTypes.WATCHING,
      name: "Dota 2 Reporter",
    },
    {
      type: ActivityTypes.COMPETING,
      name: "TI",
    },
    {
      type: ActivityTypes.PLAYING,
      name: "Tech Expansion",
    },
    {
      type: ActivityTypes.PLAYING,
      name: "Tekkit",
    },
    {
      type: ActivityTypes.PLAYING,
      name: "Pudge",
    },
    {
      type: ActivityTypes.PLAYING,
      name: "MEEPOOO",
    },
    {
      type: ActivityTypes.PLAYING,
      name: "carry Wisp mid",
    },
    {
      type: ActivityTypes.PLAYING,
      name: "in vault 666",
    },
    {
      type: ActivityTypes.WATCHING,
      name: "Gandhi nuke everyone",
    },
    {
      type: ActivityTypes.WATCHING,
      name: "The Fellowship of the Ring",
    },
    {
      type: ActivityTypes.WATCHING,
      name: "Two Towers",
    },
    {
      type: ActivityTypes.WATCHING,
      name: "Return of the King",
    },
    {
      type: ActivityTypes.LISTENING,
      name: "The Longest Johns",
    },
    {
      type: ActivityTypes.LISTENING,
      name: "Stan Rogers",
    },
    {
      type: ActivityTypes.LISTENING,
      name: "T-Swizzle",
    },
    {
      type: ActivityTypes.PLAYING,
      name: "Connect Four",
    },
    {
      type: ActivityTypes.PLAYING,
      name: "Monopoly City",
    },
    {
      type: ActivityTypes.WATCHING,
      name: "🐱",
    },
    {
      type: ActivityTypes.PLAYING,
      name: "🎸",
    },
    {
      type: ActivityTypes.WATCHING,
      name: "🌄",
    },
    {
      type: ActivityTypes.PLAYING,
      name: "Skyrim Ultimate Special Legendary VR Anniversary Edition (Switch)",
    },
    {
      type: ActivityTypes.WATCHING,
      name: "Lydia block the doorway",
    },
  ],
};

export default botConfig;
