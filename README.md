# DiscordTS-Bot

A customizable Discord bot based on [discord.js v13](https://discord.js.org) with Typescript!

It utilizes the [Prisma ORM/ODM](https://www.prisma.io) to manage your MongoDB (can easily be modified to use other databases supported by Prisma).

Bring music to your servers with the included [Discord music player](https://discord-music-player.js.org) library!

---

## Setup

**_Requires [Node.js](https://nodejs.org/) 16.6.0 or higher_**

### Development environment

1. Create your bot application on the [Discord developer portal](https://discord.com/developers/applications)

   - Refer to the [discord.js guide](https://discordjs.guide) for directions. Specifically: [setting up your bot application](https://discordjs.guide/preparations/setting-up-a-bot-application) and then [adding it to server(s)](https://discordjs.guide/preparations/adding-your-bot-to-servers).

2. Setup your database of choice. MongoDB is the default and you can easily set up a free instance with [MongoDB Atlas](https://www.mongodb.com/atlas).

   - MongoDB is supported out of the box but SQL-based databases can be used with some changes to [src/database/schema.prisma](src/database/schema.prisma).

3. Clone/fork this repository.

4. Rename `sample.env` to `.env` and set the environment variables as defined in [src/global.d.ts](src/global.d.ts)

   > Note that **all** the environment variables are strings.

   1. `DISCORD_TOKEN`: Discord bot token (acquired in step 1).
   2. `DB_URL` Database URL
      - Unless you modified [src/database/schema.prisma](src/database/schema.prisma) to use a different type of database, this should be a MongoDB URL.
   3. `CLIENT_ID` Discord bot client ID (acquired in step 1).
   4. `TEST_GUILD_ID` guild ID of the server you want to test this bot in. Slash commands will immediately be updated for this server upon restarting the bot in developer mode.
   5. `DEV_IDS` A list of developer discord user Ids separated by ", ". Ex: `DEV_IDS = DEV_ID1, DEV_ID2, DEV_ID3`.

      - Must set at least one!

5. Run `npm ci` to install dependencies and generate Prisma client files.

6. Run `npm run dev` to start a developer environment instance!
   - Edit _and_ save any of the files in the `src` directory (with the exception of [src/database/schema.prisma](src/database/schema.prisma)) and the program will automatically restart to reflect the changes!
