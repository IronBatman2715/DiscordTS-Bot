import { readdirSync } from "fs";
import { resolve } from "path";
import { Client as DiscordClient, Collection, Intents, MessageEmbed, Permissions } from "discord.js";
import type { CacheType, CommandInteraction, GuildMember, MessageEmbedOptions } from "discord.js";
import { Routes } from "discord-api-types/v10";
import { REST } from "@discordjs/rest";
import { Player } from "discord-music-player";

import Command from "./Command";
import DB from "./DB";
import type BaseEvent from "./Event";
import camelCase2Display from "../functions/general/camelCase2Display";
import logger from "../logger";
import isUser from "../functions/discord/isUser";
import botConfig from "../botConfig";

export default class Client extends DiscordClient {
  readonly config = botConfig;
  readonly devMode: boolean;
  /** List of developer discord user Ids */
  private readonly devIds: string[] = [];

  readonly commands: Collection<string, Command> = new Collection<string, Command>();
  readonly commandCategories: string[] = [];
  readonly DB: DB = new DB(this);
  readonly player: Player;

  constructor() {
    try {
      logger.info("*** DISCORD.JS BOT: INITIALIZATION ***");

      super({
        intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES],
        allowedMentions: { repliedUser: false },
      });

      this.devMode = process.env.NODE_ENV === "development";

      logger.info("Verifying environment variables are set... ");
      if (process.env.DISCORD_TOKEN === undefined)
        throw new ReferenceError("DISCORD_TOKEN environment variable was not set!");
      if (process.env.DB_URL === undefined) throw new ReferenceError("DB_URL environment variable was not set!");
      if (this.devMode) {
        if (process.env.CLIENT_ID === undefined)
          throw new ReferenceError("CLIENT_ID environment variable was not set!");
        if (process.env.TEST_GUILD_ID === undefined)
          throw new ReferenceError("TEST_GUILD_ID environment variable was not set!");
        if (process.env.DEV_IDS === undefined) {
          throw new ReferenceError("Must set at least one discord userId to DEV_IDS!");
        } else {
          //Parse DEV_IDS
          if (process.env.DEV_IDS.length > 0) {
            this.devIds = process.env.DEV_IDS.includes(", ") ? process.env.DEV_IDS.split(", ") : [process.env.DEV_IDS];
          }
        }
      }
      logger.info("Successfully verified that environment variables are set!");

      this.player = new Player(this, {
        deafenOnJoin: true,
      });

      logger.info(
        `Loading ${this.config.name}/v${this.config.version}: ${this.devMode ? "DEVELOPMENT" : "PRODUCTION"} MODE`
      );

      //Load events
      this.loadEvents();

      //Load & Register commands
      this.loadCommands();

      logger.info("*** DISCORD.JS BOT: INITIALIZATION DONE ***");
    } catch (error) {
      logger.error(error);
      logger.error(new Error("Could not start the bot!"));
      process.exit(1);
    }
  }

  /** Login to Discord API */
  async start(): Promise<void> {
    try {
      await this.registerCommands();
      await this.DB.connect();

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

    readdirSync(commandsDir).forEach((folder) => {
      const commandsSubDir = resolve(commandsDir, folder);

      const files = readdirSync(commandsSubDir).filter((file) => file.endsWith(".ts") || file.endsWith(".js"));

      //Omit this folder if there are no valid files within it
      //Also omit this folder if it is "dev" and bot is in PRODUCTION mode
      if ((folder !== "dev" || this.devMode) && files.length > 0) {
        logger.info(`\t${camelCase2Display(folder)}`);

        files.forEach((file) => {
          const commandFilePath = resolve(commandsSubDir, file);

          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const command: Command = require(commandFilePath);

          //Set and store command categories
          command.category = folder;
          if (!this.commandCategories.includes(folder)) {
            this.commandCategories.push(folder);
          }

          //Set admin command permissions default to false
          if (command.category === "admin") {
            //command.builder.setDefaultPermission(false);
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
   * @param doGlobal [default: false] If true, will register commands to all guilds/servers this bot is in (
   * {@link https://discordjs.guide/interactions/slash-commands.html#global-commands may take up to 1 hour to register changes})
   */
  async registerCommands(doGlobal = false): Promise<void> {
    const commandDataArr = this.commands.map((command) => command.builder.toJSON());

    //Can cast `DISCORD_TOKEN` to string since it is verified in constructor
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN!);

    if (this.devMode) {
      try {
        logger.info("Registering commands with Discord API", {
          commands: { raw: this.commands, json: commandDataArr },
        });

        if (doGlobal) {
          //Register globally, will take up to one hour to register changes

          logger.info("\tPRODUCTION MODE. Registering to any server this bot is in");

          //Can cast `CLIENT_ID` to string since it is verified in constructor
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const fullRoute = Routes.applicationCommands(process.env.CLIENT_ID!);

          //Remove all previous commands
          await rest.put(fullRoute, {
            body: [],
          });

          //Add all new/updated commands
          await rest.put(fullRoute, {
            body: commandDataArr,
          });
        } else {
          //Instantly register to test guild
          logger.info(`\tDEVELOPMENT MODE. Only registering in guild with "TEST_GUILD_ID" environment variable`);

          //Can cast `CLIENT_ID` and `TEST_GUILD_ID` to string since it is verified in constructor
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const fullRoute = Routes.applicationGuildCommands(process.env.CLIENT_ID!, process.env.TEST_GUILD_ID!);

          //Add all new/updated commands. Does NOT remove no longer used commands!
          await rest.put(fullRoute, {
            body: commandDataArr,
          });
        }

        logger.info(`\tSuccessfully registered ${doGlobal ? "global" : "test guild"} commands with Discord API!`);
      } catch (error) {
        logger.error(error);
        logger.error(new Error("Errored attempting to register commands with Discord API!"));
      }
    } else {
      logger.info("Skipped registering commands with Discord API (production mode)");
    }
  }

  /** Load events */
  private loadEvents(): void {
    logger.info("Events:");

    const eventsDir = resolve(__dirname, "../events");

    readdirSync(eventsDir).forEach((folder) => {
      const eventsSubDir = resolve(eventsDir, folder);

      const files = readdirSync(eventsSubDir).filter((file) => file.endsWith(".ts") || file.endsWith(".js"));

      //Omit this folder if there are no valid files within it
      if (files.length > 1) {
        logger.info(`\t${camelCase2Display(folder)}`);

        files.forEach((file) => {
          const eventFilePath = resolve(eventsSubDir, file);
          const eventFileName = file.slice(0, file.length - 3);

          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const event: BaseEvent = require(eventFilePath);

          //Bind event to its corresponding event emitter
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

  /** Generate embed with default values and check for valid data */
  genEmbed(data: Partial<MessageEmbedOptions> = {}): MessageEmbed {
    //Check for invalid entries
    if (data.fields !== undefined) {
      //Cannot have more than 25 fields in one embed
      if (data.fields.length > 25) {
        throw new RangeError("Client.genEmbed() tried to generate an embed with more than 25 fields!");
      }
    }

    //Generate base embed
    const embed = new MessageEmbed(data);

    //Add in default values
    if (data.timestamp === undefined) {
      embed.setTimestamp(new Date());
    }
    if (data.color === undefined) {
      embed.setColor("DARK_BLUE");
    }
    if (data.footer === undefined) {
      embed.setFooter({
        text: this.config.name,
      });
    }

    return embed;
  }

  async runCommand(command: Command, interaction: CommandInteraction<CacheType>): Promise<void> {
    //Validate this user can use this command
    switch (command.category) {
      //Admin only commands
      case "admin": {
        if (
          !isUser(interaction.member as GuildMember, {
            permissions: Permissions.FLAGS.ADMINISTRATOR,
          })
        ) {
          await interaction.followUp({
            content: `This is a administrator only command!`,
          });
          return;
        }
        break;
      }

      //Developer only commands
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
