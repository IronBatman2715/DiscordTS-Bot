import { join } from "node:path";
import { DefaultExtractors } from "@discord-player/extractor";
import type {
  ChatInputCommandInteraction,
  EmbedData,
  EmbedField,
  GuildMember,
  InteractionReplyOptions,
  InteractionUpdateOptions,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  StringSelectMenuOptionBuilder,
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
import { Player, useMainPlayer } from "discord-player";
import { YoutubeiExtractor } from "discord-player-youtubei";

import type { BotConfig } from "../botConfig.js";
import { getConfigFile } from "../botConfig.js";
import { getGuildConfig } from "../database/GuildConfig.js";
import { connect as connectToDB } from "../database/index.js";
import isUser from "../functions/discord/isUser.js";
import { isDevEnvironment } from "../functions/general/environment.js";
import { forNestedDirsFiles, importDefaultESM } from "../functions/general/fs.js";
import { camel2Display, isOnlyDigits } from "../functions/general/strings.js";
import logger from "../logger.js";
import type Command from "./Command.js";
import { isCommand } from "./Command.js";
import { EventEmitterType, eventEmitterTypeFromDir, isBaseEvent } from "./Event.js";

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
  private started = false;

  readonly commands: Collection<string, Command> = new Collection<string, Command>();
  readonly commandCategories: string[] = [];

  /** Get/Generate singleton instance */
  static async get() {
    if (!Client.instance) {
      Client.instance = new Client();

      try {
        /* Would like these two to be in constructor, but await is not allowed in constructor */
        await Client.instance.loadEvents();
        await Client.instance.loadCommands();
      } catch (error) {
        logger.error(error);
        logger.error(new Error("Could not load bot files!"));
        process.exit(1);
      }

      logger.info("*** DISCORD.JS BOT: CONSTRUCTION DONE ***");
    }
    return Client.instance;
  }

  // biome-ignore lint/correctness/noUnreachableSuper: may error
  private constructor() {
    try {
      logger.info("*** DISCORD.JS BOT: CONSTRUCTION ***");

      super({
        intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
        allowedMentions: { repliedUser: false },
      });

      this.devMode = isDevEnvironment();
      logger.info(`Loading in ${this.devMode ? "DEVELOPMENT" : "PRODUCTION"} MODE`);

      this.version = process.env.npm_package_version ?? "UNKNOWN";
      logger.verbose(`Bot version: ${this.version}`);

      logger.verbose("Verifying environment variables are set in a valid form... ");

      // Always required environment variables
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
      }
      logger.verbose("Successfully verified that environment variables are set in a valid form!");
      logger.warn(
        "Note that environment variable *values* can NOT be verified. They may still error at first use if the value(s) are invalid!"
      );

      logger.info("Initializing discord player");
      new Player(this);

      logger.info("Loading config file");
      this.config = getConfigFile();
      logger.info(`Loaded config for "${this.config.name}"`);
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

      await connectToDB();
      logger.info("Loading discord player extractors");
      const player = useMainPlayer();
      await player.extractors.register(YoutubeiExtractor, {});
      await player.extractors.loadMulti(DefaultExtractors);

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
    await forNestedDirsFiles(commandsDir, async (commandFilePath, category, _) => {
      if (category === "dev" && !this.devMode) {
        logger.error(new Error(`Development only commands are present in production environment`));
        process.exit(1);
      }

      const command = await importDefaultESM(commandFilePath, isCommand);

      // Set and store command categories
      command.category = category;
      if (!this.commandCategories.includes(category)) {
        logger.debug(`\t${camel2Display(category)}`);
        this.commandCategories.push(category);
      }

      // Set admin command permissions default to false
      if (command.category === "admin") {
        // command.builder.setDefaultPermission(false);
      }

      this.commands.set(command.builder.name, command);

      // Log now to signify loading this file is complete
      logger.debug(`\t\t${command.builder.name}`);
    });
    logger.debug("Successfully loaded commands");
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

        // biome-ignore lint/style/noNonNullAssertion: this is a non-static method and `TEST_GUILD_ID` is verified in constructor
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

    const player = useMainPlayer();

    const eventsDir = join(import.meta.dirname, "..", "events");
    const eventEmitterTypes: EventEmitterType[] = [];
    await forNestedDirsFiles(eventsDir, async (eventFilePath, dir, file) => {
      // Validate directory
      const eventEmitterType = eventEmitterTypeFromDir(dir);
      if (!eventEmitterTypes.includes(eventEmitterType)) {
        logger.debug(`\t${camel2Display(EventEmitterType[eventEmitterType])}`);
        eventEmitterTypes.push(eventEmitterType);
      }

      // Load module
      const event = await importDefaultESM(eventFilePath, isBaseEvent);
      const eventFileName = file.replace(/\.[^/.]+$/, "");

      // Bind event to its corresponding event emitter
      if (eventEmitterType === EventEmitterType.Client && event.isClient()) {
        event.bindToEventEmitter(this);
      } else if (eventEmitterType === EventEmitterType.MusicPlayer && event.isMusicPlayer()) {
        event.bindToEventEmitter(player);
      } else if (eventEmitterType === EventEmitterType.MusicPlayerGuildQueue && event.isMusicPlayerGuildQueue()) {
        event.bindToEventEmitter(player.events);
      } else if (eventEmitterType === EventEmitterType.Prisma && event.isPrisma()) {
        event.bindToEventEmitter();
      } else {
        throw new Error(
          `Event file does not match expected emitter type ("${EventEmitterType[eventEmitterType]}"): "${eventFileName}"` +
            `. ` +
            `This file probably belongs in a different directory (i.e. ...events/client instead of ...events/prisma)`
        );
      }

      // Log now to signify loading this file is complete
      if (event.event !== eventFileName) {
        logger.debug(`\t\t"${eventFileName}" -> ${event.event}`);
      } else {
        logger.debug(`\t\t${eventFileName}`);
      }
    });
    logger.debug("Successfully loaded events");
  }

  /** Generate embed with default values and check for
   * {@link https://discordjs.guide/popular-topics/embeds.html#embed-limits valid data}
   */
  genEmbed(data: Partial<EmbedData> = {}): EmbedBuilder {
    logger.verbose("Generating embed");

    // Check for invalid entries
    if (data.title !== undefined && data.title.length > 256) {
      logger.warn("Had to shorten an embed title.", { embedTitle: data.title });
      data.title = `${data.title.substring(0, 256 - 3)}...`;
    }
    if (data.description !== undefined && data.description.length > 4096) {
      logger.warn("Had to shorten an embed description.", { embedDescription: data.description });
      data.description = `${data.description.substring(0, 4096 - 3)}...`;
    }
    if (data.fields !== undefined) {
      // Cannot have more than 25 fields in one embed
      if (data.fields.length > 25) {
        logger.warn("Had to shorten an embed's fields.", { embedFields: data.fields });
        data.fields = data.fields.slice(0, 25);
      }
      data.fields.forEach((f) => {
        if (f.name.length > 256) {
          logger.warn("Had to shorten an embed field name.", { embedFieldName: f.name });
          f.name = `${f.name.substring(0, 256 - 3)}...`;
        }
        if (f.value.length > 1024) {
          logger.warn("Had to shorten an embed field value.", { embedFieldValue: f.value });
          f.value = `${f.value.substring(0, 1024 - 3)}...`;
        }
      });
    }
    if (data.footer?.text !== undefined && data.footer.text.length > 2048) {
      logger.warn("Had to shorten an embed footer text.", { embedFooterText: data.footer.text });
      data.footer.text = `${data.footer.text.substring(0, 2048 - 3)}...`;
    }
    if (data.author?.name !== undefined && data.author.name.length > 256) {
      logger.warn("Had to shorten an embed author name.", { embedAuthorName: data.author.name });
      data.author.name = `${data.author.name.substring(0, 256 - 3)}...`;
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
    logger.verbose(`Using ${Math.ceil(embedFields.length / maxFieldsPerEmbed)} page${canFitOnOnePage ? "" : "s"}.`);

    const originalTitle = (() => {
      if (otherEmbedData.title !== undefined) {
        if (otherEmbedData.title.length > 256) {
          logger.warn("Had to shorten an embed title.", { embedTitle: otherEmbedData.title });
          return `${otherEmbedData.title.substring(0, 256 - 3)}...`;
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
        componentInteraction.update(genReplyOptions(i)).catch((e: unknown) => {
          if (e instanceof Error) {
            throw e;
          } else {
            throw new Error(`Could not update message component collector: ${e}`);
          }
        });
      });
    }

    return embedMessage;
  }

  normalizeStringSelectMenuOptions(
    options: StringSelectMenuOptionBuilder[]
  ): [StringSelectMenuOptionBuilder[], boolean] {
    // https://github.com/discordjs/discord.js/blob/main/packages/builders/src/components/Assertions.ts

    if (options.length > 25) {
      logger.warn(
        new RangeError("Tried to generate a string select menu with more than 25 options! Truncating to 25.")
      );

      return [options.slice(0, 25), true];
    } else {
      return [options, false];
    }
  }

  async runCommand(command: Command, interaction: ChatInputCommandInteraction): Promise<void> {
    // Show user that command is loading
    await interaction.deferReply();

    // For now, all commands should assume we are in a guild.
    // Subject to change.
    if (!interaction.inGuild()) {
      logger.warn(`Tried to run \`/${command.builder.name}\` command outside of a server/guild`);
      await interaction.followUp({ content: "This bot only supports commands in a server/guild!" });
      return;
    }

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

      case "music": {
        const { musicChannelId } = await getGuildConfig(interaction.guildId);

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

      default: {
        break;
      }
    }

    logger.info(
      `Guild "${interaction.guild?.name ?? "NO NAME"}" [id: ${interaction.guildId}] ran \`/${command.builder.name}\` command`
    );
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
