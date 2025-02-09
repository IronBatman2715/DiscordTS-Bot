import type { JSONSchemaType } from "ajv";
import { Ajv } from "ajv";
import addErrors from "ajv-errors";
import addFormats from "ajv-formats";
import { ActivityType } from "discord.js";
import { constants, copyFileSync, existsSync, readFileSync, writeFileSync } from "fs";
import lodash from "lodash";

import { isDevEnvironment } from "./functions/general/environment.js";

// eslint-disable-next-line @typescript-eslint/unbound-method
const { capitalize } = lodash;

export interface ActivityOption {
  /** String after type string */
  name: string;
  /** Supported activity types {@link https://discord.com/developers/docs/events/gateway-events#activity-object-activity-structure for a bot}
   */
  type: Exclude<ActivityType, ActivityType.Custom>;
  /** Stream url. Either a {@link https://discord.com/developers/docs/events/gateway-events#activity-object-activity-types Twitch or YouTube url}
   *
   * Should only be present if `type` is `ActivityType.Streaming`
   */
  url?: string;
}

export interface BotConfig {
  name: string;
  activities: ActivityOption[];
}

const ajv = addErrors(addFormats(new Ajv({ allErrors: true })));

// Format for ActivityOption.url
ajv.addFormat("streaming-uri", /^https:\/\/(www\.)?(twitch\.tv|youtube\.com)\/.+$/);

interface ActivityOptionJSON {
  name: string;
  type: "playing" | "streaming" | "listening" | "watching" | "competing";
  url?: string;
}

interface BotConfigJSON {
  name: string;
  activities: ActivityOptionJSON[];
}

const schema: JSONSchemaType<BotConfigJSON> = {
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
            type: "string",
            enum: ["playing", "streaming", "listening", "watching", "competing"],
            errorMessage: {
              enum: `must equal one of the allowed values (case-sensitive): "playing", "streaming", "listening", "watching", "competing"`,
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
    const configFileName = isDev ? "config.dev.json" : "config.json";

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
    config = fromJSON(parseFile(configFileName));
  }

  return config;
}

function parseFile(fileName: string): BotConfigJSON {
  const json: unknown = JSON.parse(readFileSync(fileName, "utf-8"));

  if (!validate(json)) {
    let errorMsg = "Invalid config file:";
    validate.errors?.forEach(({ instancePath, message }) => {
      errorMsg += `\n\t${instancePath} ${message ?? ""}.`;
    });
    throw new Error(errorMsg);
  }

  // TODO: make this check with schema instead of manual check
  const manualInvalid = json.activities
    .map((a, i) => {
      return { a, i }; // need index for error message
    })
    .filter(({ a }) => {
      return a.type !== "streaming" && a.url !== undefined;
    });
  if (manualInvalid.length !== 0) {
    let errorMsg = "Invalid config file:";
    manualInvalid.forEach(({ i }) => {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      errorMsg += `\n\t/activities/${i}/url should only have "url" property when "type" is "streaming"`;
    });
    throw new Error(errorMsg);
  }

  return json;
}

function fromJSON(data: BotConfigJSON): BotConfig {
  const activities: ActivityOption[] = data.activities.map((a) => {
    return {
      name: a.name,
      type: ActivityType[capitalize(a.type)],
      url: a.url,
    };
  });

  return {
    name: data.name,
    activities,
  };
}
