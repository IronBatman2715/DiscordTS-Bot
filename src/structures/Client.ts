import { Player } from "discord-player";
import type {
  CacheType,
  ChatInputCommandInteraction,
  EmbedData,
  EmbedField,
  GuildMember,
  InteractionReplyOptions,
  InteractionUpdateOptions,
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
import { readdirSync } from "fs";
import { resolve } from "path";

import type { BotConfig } from "../botConfig";
import { defaultBotConfig, getConfigFile } from "../botConfig";
import isUser from "../functions/discord/isUser";
import camelCase2Display from "../functions/general/camelCase2Display";
import type Command from "./Command";
import DB from "./DB";
import type BaseEvent from "./Event";
import logger from "./Logger";

type SendMultiPageEmbedOptions = {
  maxFieldsPerEmbed: number;
  otherEmbedData: Partial<Omit<EmbedData, "fields">>;
  otherReplyOptions: Partial<Omit<InteractionReplyOptions & InteractionUpdateOptions, "embeds" | "components">>;
};

export default class Client extends DiscordClient {
  /** Singleton instance */
  private static instance: Client;
  readonly config: BotConfig;
  readonly version: string;
  /** True in development environment, otherwise false */
  readonly devMode: boolean;
  /** List of developer discord user Ids */
  private readonly devIds: string[] = [];

  readonly commands: Collection<string, Command> = new Collection<string, Command>();
  readonly commandCategories: string[] = [];
  readonly DB: DB = DB.get();
  readonly player: Player;

  /** Get/Generate singleton instance */
  static get() {
    if (!Client.instance) Client.instance = new this();
    return Client.instance;
  }

  private constructor() {
    try {
      logger.info("*** DISCORD.JS BOT: INITIALIZATION ***");

      super({
        intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
        allowedMentions: { repliedUser: false },
      });

      this.devMode = process.env.NODE_ENV === "development";
      this.version = `${process.env.npm_package_version}${this.devMode ? "-dev" : ""}`;

      logger.info("Verifying environment variables are set... ");

      // Always required environment variables
      if (process.env.DISCORD_TOKEN === undefined)
        throw new ReferenceError("DISCORD_TOKEN environment variable was not set!");
      if (process.env.DB_URL === undefined) throw new ReferenceError("DB_URL environment variable was not set!");
      if (process.env.CLIENT_ID === undefined) throw new ReferenceError("CLIENT_ID environment variable was not set!");

      // Development environment variables
      if (this.devMode) {
        if (process.env.TEST_GUILD_ID === undefined)
          throw new ReferenceError("TEST_GUILD_ID environment variable was not set!");
        if (process.env.DEV_IDS === undefined) {
          throw new ReferenceError("Must set at least one discord userId to DEV_IDS!");
        } else {
          // Parse DEV_IDS
          if (process.env.DEV_IDS.length > 0) {
            this.devIds = process.env.DEV_IDS.includes(", ") ? process.env.DEV_IDS.split(", ") : [process.env.DEV_IDS];
          }
        }
      }
      logger.info("Successfully verified that environment variables are set!");

      this.player = new Player(this);

      // Load config
      this.config = this.devMode ? defaultBotConfig : getConfigFile();

      logger.info(`Loading ${this.config.name}@${this.version}: ${this.devMode ? "DEVELOPMENT" : "PRODUCTION"} MODE`);

      // Load events
      this.loadEvents();

      // Load & Register commands
      this.loadCommands();

      logger.info("*** DISCORD.JS BOT: INITIALIZATION DONE ***");
    } catch (error) {
      logger.error(error);
      logger.error(new Error("Could not initialize the bot!"));
      process.exit(1);
    }
  }

  /** Login to Discord API */
  async start(): Promise<void> {
    try {
      if (this.devMode) await this.registerCommands();

      await this.DB.connect();
      await this.player.extractors.loadDefault();

      logger.info("Logging in... ");
      await this.login(process.env.DISCORD_TOKEN);
    } catch (error) {
      logger.error(error);
      logger.error(new Error("Could not start the bot! Make sure your environment variables are valid!"));
      process.exit(1);
    }
  }

  /** Load slash commands */
  private loadCommands(): void {
    logger.info("Commands:");

    const commandsDir = resolve(__dirname, "../commands");

    readdirSync(commandsDir).forEach((subDir) => {
      const commandsSubDir = resolve(commandsDir, subDir);

      const files = readdirSync(commandsSubDir).filter((file) => file.endsWith(".ts") || file.endsWith(".js"));

      // Omit this subDir if there are no valid files within it
      // Also omit this subDir if it is "dev" and bot is in PRODUCTION mode
      if ((subDir !== "dev" || this.devMode) && files.length > 0) {
        logger.info(`\t${camelCase2Display(subDir)}`);

        files.forEach((file) => {
          const commandFilePath = resolve(commandsSubDir, file);

          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const command: Command = require(commandFilePath);

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

          logger.info(`\t\t${command.builder.name}`);
        });
      }
    });
  }

  /**
   * Register command files with Discord API.
   *
   * MUST have run {@link Client.loadCommands() loadCommands()} first (runs in constructor)!
   *
   * If `devMode` property is false, will register commands to all guilds/servers this bot is in (
   * {@link https://discordjs.guide/interactions/slash-commands.html#global-commands may take up to 1 hour to register changes})
   */
  async registerCommands(): Promise<void> {
    const commandDataArr = this.commands.map((command) => command.builder.toJSON());

    logger.info("Registering commands with Discord API", {
      commands: { raw: this.commands, json: commandDataArr },
    });

    const rest = new REST().setToken(process.env.DISCORD_TOKEN);

    try {
      if (this.devMode) {
        // Instantly register to test guild
        logger.info(`\tDEVELOPMENT MODE. Only registering in guild with "TEST_GUILD_ID" environment variable`);

        // Can cast `TEST_GUILD_ID` to string since it is verified in constructor
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const fullRoute = Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.TEST_GUILD_ID!);

        // Add all new/updated commands. Does NOT remove no longer used commands!
        await rest.put(fullRoute, {
          body: commandDataArr,
        });
      } else {
        // Register globally, can take up to one hour to register changes
        logger.info("\tPRODUCTION MODE. Registering to any server this bot is in");

        const fullRoute = Routes.applicationCommands(process.env.CLIENT_ID);

        // Add all new/updated commands
        await rest.put(fullRoute, {
          body: commandDataArr,
        });
      }

      logger.info(
        `\tSuccessfully registered ${
          this.devMode ? "test guild development" : "global production"
        } commands with Discord API!`
      );
    } catch (error) {
      logger.error(error);
      logger.error(new Error("Errored attempting to register commands with Discord API!"));
    }
  }

  /** Load events */
  private loadEvents(): void {
    logger.info("Events:");

    const eventsDir = resolve(__dirname, "../events");

    readdirSync(eventsDir).forEach((subDir) => {
      const eventsSubDir = resolve(eventsDir, subDir);

      const files = readdirSync(eventsSubDir).filter((file) => file.endsWith(".ts") || file.endsWith(".js"));

      // Omit this subDir if there are no valid files within it
      if (files.length > 0) {
        logger.info(`\t${camelCase2Display(subDir)}`);

        files.forEach((file) => {
          const eventFilePath = resolve(eventsSubDir, file);
          const eventFileName = file.slice(0, file.length - 3);

          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const event: BaseEvent = require(eventFilePath);

          // Bind event to its corresponding event emitter
          event.bindToEventEmitter(this);

          if (event.event !== eventFileName) {
            logger.info(`\t\t"${eventFileName}" -> ${event.event}`);
          } else {
            logger.info(`\t\t${eventFileName}`);
          }
        });
      }
    });
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
    interaction: ChatInputCommandInteraction<CacheType>,
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
    const maxFieldsPerEmbed = options.maxFieldsPerEmbed || 5;
    const otherEmbedData = options.otherEmbedData || {};
    const otherReplyOptions = options.otherReplyOptions || {};

    const canFitOnOnePage = embedFields.length <= maxFieldsPerEmbed;
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
        const titlePageSubstr = `${startIndex + 1}-${startIndex + limitedEmbedFields.length} out of ${
          embedFields.length
        }`;
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
      collector.on("collect", async (componentInteraction) => {
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
        await componentInteraction.update(genReplyOptions(i));
      });
    }

    return embedMessage;
  }

  async runCommand(command: Command, interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
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
          const musicChannelObj = await interaction.guild?.channels.fetch(musicChannelId);
          await interaction.followUp({
            content: `Must enter music commands in ${musicChannelObj}!`,
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

    const guildName = interaction.guild?.name || "NO NAME";
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
