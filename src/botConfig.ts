import type { JSONSchemaType } from "ajv";
import { Ajv } from "ajv";
import addErrors from "ajv-errors";
import addFormats from "ajv-formats";
import { ActivityType } from "discord.js";
import { constants, copyFileSync, existsSync, readFileSync, writeFileSync } from "fs";

import { isDevEnvironment } from "./functions/general/environment.js";

export interface ActivitiesOptions {
  /** String after type string */
  name: string;
  /** `0 | 1 | 2 | 3 | 5` */
  type: Exclude<ActivityType, ActivityType.Custom>;
  /** Either a Twitch or YouTube url
   *
   * Should only be present if `type` is `1 | ActivityType.Streaming`
   *
   * TODO: add validation of this in JSON schema
   */
  url?: string;
}

export interface BotConfig {
  name: string;
  activities: ActivitiesOptions[];
}

const ajv = addErrors(addFormats(new Ajv({ allErrors: true })));

// https://discord.com/developers/docs/events/gateway-events#activity-object-activity-types
ajv.addFormat("streaming-uri", /^https:\/\/(www\.)?(twitch\.tv|youtube\.com)\/.+$/);

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
            format: "streaming-uri",
            nullable: true,
            errorMessage: {
              format: "must be a valid youtube or twitch url",
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

let config: BotConfig | undefined;

/** Load config from filesystem or generate it from defaults.
 *
 * Can NOT use logger inside this function as the logger requires the config file!
 */
export function getConfigFile(): BotConfig {
  if (config === undefined) {
    const DEFAULT_CONFIG_FILE_NAME = "config.default.json";

    const isDev = isDevEnvironment();
    const configFileName = isDev ? "config.development.json" : "config.json";

    if (!existsSync(configFileName)) {
      console.info(`Generating "${configFileName}"`);

      if (isDev) {
        // Edit and then copy

        const defaultJson = parseFile(DEFAULT_CONFIG_FILE_NAME);
        defaultJson.name = defaultJson.name + "-dev";

        writeFileSync(configFileName, `${JSON.stringify(defaultJson, null, "  ")}\n`, {
          encoding: "utf-8",
          flag: "wx", // error if already exists
        });
      } else {
        // Simply copy

        copyFileSync(DEFAULT_CONFIG_FILE_NAME, configFileName, constants.COPYFILE_EXCL); // error if already exists
      }

      console.info(`Successfully generated "${configFileName}"\n`);
    }
    config = parseFile(configFileName);
  }

  return config;
}

function parseFile(fileName: string): BotConfig {
  const json: unknown = JSON.parse(readFileSync(fileName, "utf-8"));

  if (!validate(json)) {
    let errorMsg = "Invalid config file:";
    validate.errors?.forEach(({ instancePath, message }) => {
      errorMsg += `\n\t${instancePath} ${message ?? ""}.`;
    });
    throw new Error(errorMsg);
  }

  return json;
}
