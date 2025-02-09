declare global {
  namespace NodeJS {
    interface ProcessEnv {
      /** Discord bot token (found {@link https://discord.com/developers/applications here}) */
      DISCORD_TOKEN: string;
      /** Database URL ({@link https://pris.ly/d/connection-strings more info}) */
      DB_URL: string;
      /** Discord bot's client ID (found {@link https://discord.com/developers/applications here}) */
      CLIENT_ID: string;

      // Development only variables
      /** The guildId of your testing server */
      TEST_GUILD_ID?: string;

      /** Defines runtime environment type (omittance defaults to "production").
       *
       * **SHOULD NOT NEED TO SET MANUALLY**. This is handled in `package.json` script calls.
       */
      NODE_ENV?: "development" | "production";
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {};
