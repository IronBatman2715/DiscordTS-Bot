import { Player } from "discord-player";
import { YoutubeiExtractor } from "discord-player-youtubei";
import type {
  ChatInputCommandInteraction,
  EmbedData,
  EmbedField,
  GuildMember,
  InteractionReplyOptions,
  InteractionUpdateOptions,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "discord.js";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Collection,
  Colors,
  Client as DiscordClient,
  EmbedBuilder,
  GatewayIntentBits,
  PermissionsBitField,
  REST,
  Routes,
} from "discord.js";
import { readdir } from "fs/promises";
import { join } from "path";

import type { BotConfig } from "../botConfig.js";
import { defaultBotConfig, getConfigFile } from "../botConfig.js";
import isUser from "../functions/discord/isUser.js";
import { dynamicImportDefaultESM } from "../functions/general/dynamicImportESM.js";
import { isDevEnvironment } from "../functions/general/environment.js";
import { camel2Display, isOnlyDigits } from "../functions/general/strings.js";
import type Command from "./Command.js";
import { isCommand } from "./Command.js";
import DB from "./DB.js";
import { implementsBaseEvent } from "./Event.js";
import logger from "./Logger.js";

export enum DiscordAPIAction {
  /** Update commands. Will NOT remove commands with names that are no longer in use! */
  Register = 0,
  /** Reset commands to empty. */
  Reset = 1,
}

interface SendMultiPageEmbedOptions {
  maxFieldsPerEmbed: number;
  otherEmbedData: Partial<Omit<EmbedData, "fields">>;
  otherReplyOptions: Partial<Omit<InteractionReplyOptions & InteractionUpdateOptions, "embeds" | "components">>;
}

export default class Client extends DiscordClient {
  /** Singleton instance */
  private static instance?: Client;
  readonly config: BotConfig;
  readonly version: string;
  /** True in development environment, otherwise false */
  readonly devMode: boolean;
  /** List of developer discord user Ids */
  private readonly devIds: string[] = [];
  private started = false;

  readonly commands: Collection<string, Command> = new Collection<string, Command>();
  readonly commandCategories: string[] = [];
  readonly DB = DB;
  readonly player: Player;

  /** Get/Generate singleton instance */
  static async get() {
    if (!Client.instance) {
      Client.instance = new this();

      /* Would like these two to be in constructor, but await is not allowed in constructor */
      await Client.instance.loadEvents();
      await Client.instance.loadCommands();

      logger.info("*** DISCORD.JS BOT: CONSTRUCTION DONE ***");
    }
    return Client.instance;
  }

  private constructor() {
    try {
      logger.info("*** DISCORD.JS BOT: CONSTRUCTION ***");

      super({
        intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
        allowedMentions: { repliedUser: false },
      });

      this.devMode = isDevEnvironment();
      logger.info(`Loading in ${this.devMode ? "DEVELOPMENT" : "PRODUCTION"} MODE`);

      this.version = `${process.env.npm_package_version}${this.devMode ? "-dev" : ""}`;
      logger.verbose(`Bot version: ${this.version}`);

      logger.verbose("Verifying environment variables are set in a valid form... ");

      // Always required environment variables
      /* eslint-disable @typescript-eslint/no-unnecessary-condition */
      if (process.env.DISCORD_TOKEN === undefined)
        throw new ReferenceError("DISCORD_TOKEN environment variable was not set!");
      if (process.env.DB_URL === undefined) throw new ReferenceError("DB_URL environment variable was not set!");
      if (process.env.CLIENT_ID === undefined) {
        throw new ReferenceError("CLIENT_ID environment variable was not set!");
      } else {
        // Validate form of CLIENT_ID
        if (!isOnlyDigits(process.env.CLIENT_ID)) {
          throw new TypeError("CLIENT_ID environment variable must contain only digits!");
        }
      }
      /* eslint-enable @typescript-eslint/no-unnecessary-condition */

      // Development environment variables
      if (this.devMode) {
        if (process.env.TEST_GUILD_ID === undefined) {
          throw new ReferenceError("TEST_GUILD_ID environment variable was not set!");
        } else {
          // Validate form of TEST_GUILD_ID
          if (!isOnlyDigits(process.env.TEST_GUILD_ID)) {
            throw new TypeError("TEST_GUILD_ID environment variable must contain only digits!");
          }
        }
        if (process.env.DEV_IDS === undefined || process.env.DEV_IDS === "") {
          throw new ReferenceError("Must set at least one discord userId to DEV_IDS!");
        } else {
          // Parse and validate form of DEV_IDS
          const devIds = process.env.DEV_IDS.includes(", ") ? process.env.DEV_IDS.split(", ") : [process.env.DEV_IDS];
          for (const devId of devIds) {
            if (!isOnlyDigits(devId)) {
              throw new TypeError("DEV_IDS environment variable is invalid! Refer to `global.d.ts` for guidance");
            }
          }
          this.devIds = devIds;
        }
      }
      logger.verbose("Successfully verified that environment variables are set in a valid form!");
      logger.warn(
        "Note that environment variable *values* can NOT be verified. They may still error at first use if the value(s) are invalid!"
      );

      this.player = new Player(this);

      if (this.devMode) {
        this.config = defaultBotConfig;
        logger.info(`Loaded default config`);
      } else {
        logger.info("Loading config file");
        this.config = getConfigFile();
        logger.info(`Loaded config for "${this.config.name}"`);
      }
    } catch (error) {
      logger.error(error);
      logger.error(new Error("Could not construct bot!"));
      process.exit(1);
    }
  }

  /** Start bot by connecting to external server(s). Namely, Discord itself */
  async start(): Promise<void> {
    if (this.started) {
      logger.warn("Client is already started. Do not need to call `Client.start()` again.");
      return;
    }

    try {
      if (this.devMode) await this.manageDiscordAPICommands(DiscordAPIAction.Register);

      await this.DB.connect();
      logger.info("Loading discord player extractors");
      await this.player.extractors.register(YoutubeiExtractor, {});
      await this.player.extractors.loadDefault((ext) => !["YouTubeExtractor"].includes(ext));

      logger.info("Logging into Discord... ");
      await this.login(process.env.DISCORD_TOKEN);
      this.started = true;
    } catch (error) {
      logger.error(error);
      logger.error(new Error("Could not start the bot! Make sure your environment variables are valid!"));
      process.exit(1);
    }
  }

  /** Load slash commands */
  private async loadCommands(): Promise<void> {
    logger.info("Loading commands");

    const commandsDir = join(import.meta.dirname, "..", "commands");

    for (const subDir of await readdir(commandsDir)) {
      const commandsSubDir = join(commandsDir, subDir);

      const files = (await readdir(commandsSubDir)).filter((file) => file.endsWith(".ts") || file.endsWith(".js"));

      // Omit this subDir if there are no valid files within it
      // Also omit this subDir if it is "dev" and bot is in PRODUCTION mode
      if ((subDir !== "dev" || this.devMode) && files.length > 0) {
        logger.verbose(`\t${camel2Display(subDir)}`);

        for (const file of files) {
          const commandFilePath = join(commandsSubDir, file);

          const command = await dynamicImportDefaultESM(commandFilePath, isCommand);

          // Set and store command categories
          command.category = subDir;
          if (!this.commandCategories.includes(subDir)) {
            this.commandCategories.push(subDir);
          }

          // Set admin command permissions default to false
          if (command.category === "admin") {
            // command.builder.setDefaultPermission(false);
          }

          this.commands.set(command.builder.name, command);

          logger.verbose(`\t\t${command.builder.name}`);
        }
      }
    }

    logger.verbose("Successfully loaded commands");
  }

  /**
   * Manage this bots registered commands with the Discord API.
   *
   * This should typically ONLY BE RUN MANUALLY via npm scripts.
   *
   * Options are in {@link DiscordAPIAction}
   *
   * If `devMode` property is false, will register commands to all guilds/servers this bot is in (
   * {@link https://discordjs.guide/interactions/slash-commands.html#global-commands may take up to 1 hour to register changes})
   */
  async manageDiscordAPICommands(action: DiscordAPIAction): Promise<void> {
    let actionDescriptor: string;
    let commandDataArr: RESTPostAPIChatInputApplicationCommandsJSONBody[];
    switch (action) {
      case DiscordAPIAction.Register: {
        if (this.commands.size < 1) {
          throw new Error(`Must run Client.loadCommands() first (runs in constructor)!`);
        }

        actionDescriptor = "register";
        commandDataArr = this.commands.map((command) => command.builder.toJSON());

        logger.info("Registering commands with Discord API", {
          commands: { raw: this.commands, json: commandDataArr },
        });
        break;
      }
      case DiscordAPIAction.Reset: {
        actionDescriptor = "reset";
        commandDataArr = [];

        logger.info("Resetting commands with Discord API");
        break;
      }
      default: {
        throw new Error(`Invalid action type!`);
      }
    }

    const rest = new REST().setToken(process.env.DISCORD_TOKEN);

    try {
      if (this.devMode) {
        logger.info(`\tDEVELOPMENT MODE. Only working in guild with "TEST_GUILD_ID" environment variable`);

        // Can cast `TEST_GUILD_ID` to string since it is verified in constructor and this is a non-static method
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const fullRoute = Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.TEST_GUILD_ID!);

        await rest.put(fullRoute, {
          body: commandDataArr,
        });
      } else {
        logger.info(
          "\tPRODUCTION MODE. Working on all server(s) this bot is in. Can take up to one hour to register changes"
        );

        const fullRoute = Routes.applicationCommands(process.env.CLIENT_ID);

        await rest.put(fullRoute, {
          body: commandDataArr,
        });
      }

      logger.info(
        `\tSuccessfully ${actionDescriptor} ${
          this.devMode ? "test guild development" : "global production"
        } commands with Discord API!`
      );
    } catch (error) {
      logger.error(error);
      logger.error(new Error(`Errored attempting to ${actionDescriptor} commands with Discord API!`));
    }
  }

  /** Load events */
  private async loadEvents(): Promise<void> {
    logger.info("Loading events");

    const eventsDir = join(import.meta.dirname, "..", "events");

    for (const subDir of await readdir(eventsDir)) {
      const eventsSubDir = join(eventsDir, subDir);

      const files = (await readdir(eventsSubDir)).filter((file) => file.endsWith(".ts") || file.endsWith(".js"));

      // Omit this subDir if there are no valid files within it
      if (files.length > 0) {
        logger.verbose(`\t${camel2Display(subDir)}`);

        for (const file of files) {
          const eventFilePath = join(eventsSubDir, file);
          const eventFileName = file.slice(0, file.length - 3);

          const event = await dynamicImportDefaultESM(eventFilePath, implementsBaseEvent);

          // Bind event to its corresponding event emitter
          event.bindToEventEmitter(this);

          if (event.event !== eventFileName) {
            logger.verbose(`\t\t"${eventFileName}" -> ${event.event}`);
          } else {
            logger.verbose(`\t\t${eventFileName}`);
          }
        }
      }
    }

    logger.verbose("Successfully loaded events");
  }

  /** Generate embed with default values and check for valid data
   *
   * Use this if you KNOW that `data.fields` will not be longer than 25!
   */
  genEmbed(data: Partial<EmbedData> = {}): EmbedBuilder {
    logger.verbose("Generating embed");

    // Check for invalid entries
    if (data.title !== undefined && data.title.length > 256) {
      logger.warn("Had to shorten an embed title.", { embedTitle: data.title });
      data.title = data.title.substring(0, 256 - 3) + "...";
    }
    if (data.description !== undefined && data.description.length > 4096) {
      logger.warn("Had to shorten an embed description.", { embedDescription: data.description });
      data.description = data.description.substring(0, 4096 - 3) + "...";
    }
    if (data.fields !== undefined) {
      // Cannot have more than 25 fields in one embed
      if (data.fields.length > 25) {
        throw new RangeError("Client.genEmbed() tried to generate an embed with more than 25 fields!");
      }
      data.fields.forEach((f) => {
        if (f.name.length > 256) {
          logger.warn("Had to shorten an embed field name.", { embedFieldName: f.name });
          f.name = f.name.substring(0, 256 - 3) + "...";
        }
        if (f.value.length > 1024) {
          logger.warn("Had to shorten an embed field value.", { embedFieldValue: f.value });
          f.value = f.value.substring(0, 1024 - 3) + "...";
        }
      });
    }
    if (data.footer?.text !== undefined && data.footer.text.length > 2048) {
      logger.warn("Had to shorten an embed footer text.", { embedFooterText: data.footer.text });
      data.footer.text = data.footer.text.substring(0, 2048 - 3) + "...";
    }
    if (data.author?.name !== undefined && data.author.name.length > 256) {
      logger.warn("Had to shorten an embed author name.", { embedAuthorName: data.author.name });
      data.author.name = data.author.name.substring(0, 256 - 3) + "...";
    }

    // Generate base embed
    const embed = new EmbedBuilder(data);

    // Add in default values
    if (data.color === undefined) embed.setColor(Colors.DarkBlue);
    if (data.footer === undefined) embed.setFooter({ text: `${this.config.name}@${this.version}` });

    return embed;
  }

  async sendMultiPageEmbed(
    interaction: ChatInputCommandInteraction,
    embedFields: EmbedField[],
    options: Partial<SendMultiPageEmbedOptions> = {}
  ) {
    logger.verbose("Called Client.sendMultiPageEmbed().", { interaction, embedFields, options });

    // Constants
    const backId = `${this.config.name}-back-button`;
    const forwardId = `${this.config.name}-forward-button`;
    const backButton = new ButtonBuilder({
      style: ButtonStyle.Secondary,
      label: "Back",
      emoji: "⬅️",
      customId: backId,
    });
    const forwardButton = new ButtonBuilder({
      style: ButtonStyle.Secondary,
      label: "Forward",
      emoji: "➡️",
      customId: forwardId,
    });

    // Set defaults if needed
    const maxFieldsPerEmbed = options.maxFieldsPerEmbed ?? 5;
    const otherEmbedData = options.otherEmbedData ?? {};
    const otherReplyOptions = options.otherReplyOptions ?? {};

    const canFitOnOnePage = embedFields.length <= maxFieldsPerEmbed;
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    logger.verbose(`Using ${Math.ceil(embedFields.length / maxFieldsPerEmbed)} page${canFitOnOnePage ? "" : "s"}.`);

    const originalTitle = (() => {
      if (otherEmbedData.title !== undefined) {
        if (otherEmbedData.title.length > 256) {
          logger.warn("Had to shorten an embed title.", { embedTitle: otherEmbedData.title });
          return otherEmbedData.title.substring(0, 256 - 3) + "...";
        }

        return otherEmbedData.title;
      }

      return "";
    })();

    const genReplyOptions = (startIndex: number) => {
      // Generate embed data

      const limitedEmbedFields = embedFields.slice(startIndex, startIndex + maxFieldsPerEmbed);

      const fullEmbedData = otherEmbedData as Partial<EmbedData>;
      fullEmbedData.fields = limitedEmbedFields;

      if (canFitOnOnePage) {
        fullEmbedData.title = originalTitle;
      } else {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        const titlePageSubstr = `${startIndex + 1}-${startIndex + limitedEmbedFields.length} out of ${embedFields.length}`;
        if (originalTitle.length > 0) {
          fullEmbedData.title = `${originalTitle} (${titlePageSubstr})`;
        } else {
          fullEmbedData.title = titlePageSubstr;
        }
      }

      // Generate reply options

      const fullReplyOptions = otherReplyOptions as Partial<InteractionReplyOptions & InteractionUpdateOptions>;
      fullReplyOptions.embeds = [this.genEmbed(fullEmbedData)];

      if (startIndex === 0) {
        fullReplyOptions.components = canFitOnOnePage
          ? []
          : [new ActionRowBuilder<ButtonBuilder>({ components: [forwardButton] })];
      } else {
        fullReplyOptions.components = [
          new ActionRowBuilder<ButtonBuilder>({
            components: [
              // back button if it isn't the start
              ...(startIndex ? [backButton] : []),
              // forward button if it isn't the end
              ...(startIndex + maxFieldsPerEmbed < embedFields.length ? [forwardButton] : []),
            ],
          }),
        ];
      }

      return fullReplyOptions;
    };

    // Send the embed with the first `maxFieldsPerEmbed` fields
    const embedMessage = await interaction.followUp(genReplyOptions(0));

    // Ignore if there is only one page of fields (no need for all of this)
    if (!canFitOnOnePage) {
      // Collect button interactions (when a user clicks a button)
      const collector = embedMessage.createMessageComponentCollector();

      let i = 0;
      collector.on("collect", (componentInteraction) => {
        // Increase/decrease index
        if (componentInteraction.customId === forwardId) {
          logger.verbose("Someone clicked forward on multi-page embed", { embedMessage, collector });
          i += maxFieldsPerEmbed;
        }
        if (componentInteraction.customId === backId) {
          logger.verbose("Someone clicked back on multi-page embed", { embedMessage, collector });
          i -= maxFieldsPerEmbed;
        }

        // Respond to component interaction by updating message with new embed
        // TODO: probably shouldn't be voiding here. investigate for better solution
        void componentInteraction.update(genReplyOptions(i));
      });
    }

    return embedMessage;
  }

  async runCommand(command: Command, interaction: ChatInputCommandInteraction): Promise<void> {
    // Validate this user can use this command
    switch (command.category) {
      // Admin only commands
      case "admin": {
        if (
          !isUser(interaction.member as GuildMember, {
            permissions: PermissionsBitField.Flags.Administrator,
          })
        ) {
          await interaction.followUp({
            content: `This is a administrator only command!`,
          });
          return;
        }
        break;
      }

      // Developer only commands
      case "dev": {
        const userCheckOptions = { userIdList: this.devIds };
        if (!isUser(interaction.member as GuildMember, userCheckOptions)) {
          await interaction.followUp({
            content: `This is a developer only command!`,
          });
          return;
        }
        break;
      }

      case "music": {
        const { musicChannelId } = await this.DB.getGuildConfig(interaction.guildId);

        if (musicChannelId !== "" && interaction.channelId !== musicChannelId) {
          const musicChannelName =
            (await interaction.guild?.channels.fetch(musicChannelId))?.name ?? "MUSIC_CHANNEL_NAME";

          await interaction.followUp({
            content: `Must enter music commands in ${musicChannelName}!`,
          });
          return;
        }
        break;
      }

      case "general":
      default: {
        break;
      }
    }

    const guildName = interaction.guild?.name ?? "NO NAME";
    logger.info(`${guildName}[id: ${interaction.guildId}] ran \`/${command.builder.name}\` command`);
    try {
      await command.run(this, interaction);
    } catch (error) {
      logger.error(error);
      await interaction.followUp({
        content: `There was an error while executing the \`${command.builder.name}\` command!`,
      });
    }
  }
}
