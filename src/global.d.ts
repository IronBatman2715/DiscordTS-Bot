declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DISCORD_TOKEN: string; //your discord bot token
      DB_TOKEN: string; //your mongodb database token
      CLIENT_ID: string; //your bot's client ID
      TEST_GUILD_ID?: string; //the guildId of your testing server
      DEV_IDS?: string; //a list of developer discord user Ids. Ex: DEV_IDS = DEV_ID1, DEV_ID2, DEV_ID3
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {};
