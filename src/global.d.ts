declare global {
  namespace NodeJS {
    interface ProcessEnv {
      /** Discord bot token (found {@link https://discord.com/developers/applications here}) */
      DISCORD_TOKEN: string;
      /** Discord bot's client ID (found {@link https://discord.com/developers/applications here}) */
      CLIENT_ID: string;
      /** Database URL ({@link https://pris.ly/d/connection-strings more info}) */
      DB_URL: string;

      //Development only variables
      /** Defines runtime environment type (omittance defaults to "production") */
      NODE_ENV?: "development" | "production";
      /** The guildId of your testing server */
      TEST_GUILD_ID?: string;
      /** A list of developer discord user Ids separated by ", ". Ex: DEV_IDS = DEV_ID1, DEV_ID2, DEV_ID3 */
      DEV_IDS?: string;
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {};
