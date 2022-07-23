import { existsSync, readFileSync, writeFileSync } from "fs";
import { ActivityType } from "discord.js";
import Ajv from "ajv";
import type { JSONSchemaType } from "ajv";
import addFormats from "ajv-formats";
import addErrors from "ajv-errors";

export type ActivitiesOptions = {
  /** String after type string */
  name: string;
  /** `0 | 1 | 2 | 3 | 5` */
  type: Exclude<ActivityType, ActivityType.Custom>;
  /** Only add if `type` is `1 | ActivityType.Streaming` */
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
            enum: [0, 1, 2, 3, 5], //Exclude<ActivityType, ActivityType.Custom>
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
export function getConfigFile(overwrite = false): BotConfig {
  try {
    if (!existsSync("config.json") || overwrite) {
      console.info(`Generating "config.json"`);
      if (overwrite) console.warn(`Overwriting existing "config.json" if it exists!`);

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
      type: ActivityType.Playing,
      name: "Squid Game",
    },
    {
      type: ActivityType.Streaming,
      name: "the best",
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    },
    {
      type: ActivityType.Listening,
      name: "Never Gonna Give you Up",
    },
    {
      type: ActivityType.Watching,
      name: "Dota 2 Reporter",
    },
    {
      type: ActivityType.Competing,
      name: "TI",
    },
    {
      type: ActivityType.Playing,
      name: "Tech Expansion",
    },
    {
      type: ActivityType.Playing,
      name: "Tekkit",
    },
    {
      type: ActivityType.Playing,
      name: "Pudge",
    },
    {
      type: ActivityType.Playing,
      name: "MEEPOOO",
    },
    {
      type: ActivityType.Playing,
      name: "carry Wisp mid",
    },
    {
      type: ActivityType.Playing,
      name: "in vault 666",
    },
    {
      type: ActivityType.Watching,
      name: "Gandhi nuke everyone",
    },
    {
      type: ActivityType.Watching,
      name: "The Fellowship of the Ring",
    },
    {
      type: ActivityType.Watching,
      name: "Two Towers",
    },
    {
      type: ActivityType.Watching,
      name: "Return of the King",
    },
    {
      type: ActivityType.Listening,
      name: "The Longest Johns",
    },
    {
      type: ActivityType.Listening,
      name: "Stan Rogers",
    },
    {
      type: ActivityType.Listening,
      name: "T-Swizzle",
    },
    {
      type: ActivityType.Playing,
      name: "Connect Four",
    },
    {
      type: ActivityType.Playing,
      name: "Monopoly City",
    },
    {
      type: ActivityType.Watching,
      name: "🐱",
    },
    {
      type: ActivityType.Playing,
      name: "🎸",
    },
    {
      type: ActivityType.Watching,
      name: "🌄",
    },
    {
      type: ActivityType.Playing,
      name: "Skyrim Ultimate Special Legendary VR Anniversary Edition (Switch)",
    },
    {
      type: ActivityType.Watching,
      name: "Lydia block the doorway",
    },
  ],
};

export default botConfig;
