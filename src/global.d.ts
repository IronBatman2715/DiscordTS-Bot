declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DISCORD_TOKEN: string; //your discord bot token (https://discord.com/developers/applications)
      CLIENT_ID: string; //your bot's client ID (https://discord.com/developers/applications)
      DB_URL: string; //your database URL (https://pris.ly/d/connection-strings)
      TEST_GUILD_ID?: string; //the guildId of your testing server
      DEV_IDS?: string; //a list of developer discord user Ids separated by ", ". Ex: DEV_IDS = DEV_ID1, DEV_ID2, DEV_ID3
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {};
