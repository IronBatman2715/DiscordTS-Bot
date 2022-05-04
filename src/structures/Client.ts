import { readdirSync } from "fs";
import {
  CacheType,
  Client as DiscordClient,
  Collection,
  CommandInteraction,
  GuildMember,
  Intents,
  MessageEmbed,
  MessageEmbedOptions,
  Permissions,
} from "discord.js";
import { Routes } from "discord-api-types/v10";
import { REST } from "@discordjs/rest";
import { Player } from "discord-music-player";

import Command from "./Command";
import DB from "./DB";
import BaseEvent from "./Event";
import camelCase2Display from "../functions/general/camelCase2Display";
import logger from "../functions/general/logger";
import isUser from "../functions/discord/isUser";
import botConfig from "../resources/data/botConfig";

enum BasePath {
  /** Development */
  DEV = "./src",
  /** Distribution */
  DIST = "./dist",
}

export default class Client extends DiscordClient {
  readonly config = botConfig;
  readonly devMode: boolean;
  readonly basePath: string;
  readonly commands: Collection<string, Command> = new Collection<string, Command>();
  readonly commandCategories: string[] = [];
  readonly DB: DB = new DB();
  readonly player: Player;

  /**
   * @param devMode [default: false] If true, will register developer commands to the discord server corresponding to environment variable `TEST_GUILD_ID`
   */
  constructor(devMode = false) {
    console.log("*** DISCORD.JS BOT: INITIALIZATION ***");

    super({
      intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES],
      allowedMentions: { repliedUser: false },
    });

    this.devMode = devMode;
    this.basePath = this.devMode ? BasePath.DEV : BasePath.DIST;

    this.player = new Player(this, {
      deafenOnJoin: true,
    });

    console.log(`Loading ${this.config.name}/v${this.config.version}: ${this.devMode ? "DEV" : "DISTRIBUTION"} MODE`);

    //Load events
    this.loadEvents();

    //Load & Register commands
    this.loadCommands();

    console.log("*** DISCORD.JS BOT: INITIALIZATION DONE ***");
  }

  /** Login to Discord API */
  async start(): Promise<void> {
    try {
      await this.registerCommands();
      await this.DB.connect();

      logger("Logging in... ");
      await this.login(process.env.DISCORD_TOKEN);
    } catch (error) {
      console.error(error);
      console.log("Could not start the bot! Make sure your environment variables are set!");
      process.exit(1);
    }
  }

  /** Load slash commands */
  private loadCommands(): void {
    console.log("Commands:");

    readdirSync(`${this.basePath}/commands`).forEach((folder) => {
      const files = readdirSync(`${this.basePath}/commands/${folder}`).filter(
        (file) => file.endsWith(".ts") || file.endsWith(".js")
      );

      //Omit this folder if there are no valid files within it
      //Also omit this folder if it is "dev" and bot is in DISTRIBUTION mode
      if ((folder !== "dev" || this.devMode) && files.length > 0) {
        console.log(`\t${camelCase2Display(folder)}`);

        files.forEach((file) => {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const command: Command = require(`../commands/${folder}/${file}`);

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

          console.log(`\t\t${command.builder.name}`);
        });
      }
    });
  }

  /**
   * Register command files with Discord API. MUST have run {@link Client.loadCommands() loadCommands()} first!
   *
   * @param doGlobal [default: false] If true, will register commands globally (to all guilds/servers this bot is in)
   */
  async registerCommands(doGlobal = false): Promise<void> {
    const commandDataArr = this.commands.map((command) => command.builder.toJSON());

    if (process.env.DISCORD_TOKEN === undefined) throw "DISCORD_TOKEN environment variable was not set!";
    const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

    if (this.devMode) {
      try {
        console.log("Registering commands with DiscordAPI");

        if (process.env.CLIENT_ID === undefined) throw "CLIENT_ID environment variable was not set!";

        if (doGlobal) {
          //Register globally, will take up to one hour to register changes

          console.log("\tDISTRIBUTION MODE. Registering to any server this bot is in");
          const fullRoute = Routes.applicationCommands(process.env.CLIENT_ID);

          //Remove all previous commands
          /*await rest.put(fullRoute, {
            body: [],
          });*/

          //Add all new/updated commands
          await rest.put(fullRoute, {
            body: commandDataArr,
          });
        } else {
          //Instantly register to test guild
          console.log(`\tDEV MODE. Only registering in guild with "TEST_GUILD_ID" environment variable`);

          if (process.env.TEST_GUILD_ID === undefined) throw "TEST_GUILD_ID environment variable was not set!";
          const fullRoute = Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.TEST_GUILD_ID);

          //Remove all previous commands
          /*await rest.put(fullRoute, {
            body: [],
          });*/

          //Add all new/updated commands. Does NOT remove no longer used commands!
          await rest.put(fullRoute, {
            body: commandDataArr,
          });
        }

        console.log("\tSuccessfully registered commands with Discord API!");
      } catch (error) {
        console.error(error);
        console.log("Errored attempting to register commands with Discord API!");
      }
    } else {
      console.log("Skipped registering commands with DiscordAPI");
    }
  }

  /** Load events */
  private loadEvents(): void {
    console.log("Events:");

    readdirSync(`${this.basePath}/events`).forEach((folder) => {
      const files = readdirSync(`${this.basePath}/events/${folder}`).filter(
        (file) => file.endsWith(".ts") || file.endsWith(".js")
      );

      //Omit this folder if there are no valid files within it
      if (files.length > 1) {
        console.log(`\t${camelCase2Display(folder)}`);

        files.forEach((file) => {
          const eventFileName = file.slice(0, file.length - 3);

          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const event: BaseEvent = require(`../events/${folder}/${file}`);

          //Bind event to its corresponding event emitter
          event.bindToEventEmitter(this);

          if (event.event !== eventFileName) {
            console.log(`\t\t"${eventFileName}" -> ${event.event}`);
          } else {
            console.log(`\t\t${eventFileName}`);
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
        console.error("Client.genEmbed() tried to generate an embed with more than 25 fields!");
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
        if (process.env.DEV_IDS === undefined) throw "Must set at least one discord userId to DEV_IDS!";

        // Parse DEV_IDS
        const userIdList = process.env.DEV_IDS.includes(", ") ? process.env.DEV_IDS.split(", ") : [process.env.DEV_IDS];

        const userCheckOptions = { userIdList };
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

        if (musicChannelId != "" && interaction.channelId != musicChannelId) {
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
    try {
      await command.run(this, interaction);
      console.log(`${guildName}[id: ${interaction.guildId}] ran "${command.builder.name}" command\n`);
    } catch (error) {
      console.error(error);
      await interaction.followUp({
        content: `There was an error while executing the \`${command.builder.name}\` command!`,
      });
    }
  }
}
