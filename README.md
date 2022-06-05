# DiscordTS-Bot

A customizable Discord bot based on [discord.js v13](https://discord.js.org) with [Typescript](https://www.typescriptlang.org/)!

It utilizes the [Prisma ORM/ODM](https://www.prisma.io) to manage your [MongoDB](https://www.mongodb.com/) (can easily be modified to use [other databases supported by Prisma](https://www.prisma.io/docs/reference/database-reference/supported-databases)).

Bring music to your servers with the included [Discord music player](https://discord-music-player.js.org) library!

---

## Setup

***Requires [Node.js](https://nodejs.org/) 16.6.0 or higher***

### Development environment

1. Create your bot application on the [Discord developer portal](https://discord.com/developers/applications)

   - Refer to the [discord.js guide](https://discordjs.guide) for directions. Specifically: [setting up your bot application](https://discordjs.guide/preparations/setting-up-a-bot-application) and then [adding it to server(s)](https://discordjs.guide/preparations/adding-your-bot-to-servers).

   > It is recommended to use separate discord bot applications for development and production. Otherwise, it will be difficult to differentiate global commands from in development commands.

2. Setup your database of choice.

   - MongoDB is the default. You can easily set up a free instance with [MongoDB Atlas](https://www.mongodb.com/atlas).

   - MongoDB is supported out of the box but [other databases supported by Prisma](https://www.prisma.io/docs/reference/database-reference/supported-databases) can be used with some changes to [src/database/schema.prisma](src/database/schema.prisma).

3. Clone/fork this repository.

4. Rename `sample-development.env` to `development.env` and set the environment variables as defined in [src/global.d.ts](src/global.d.ts)

   > Note that **all** the environment variables are strings.

   1. `DISCORD_TOKEN`: Discord bot token (acquired in step 1).
   2. `DB_URL` Database URL
      - Unless you modified [src/database/schema.prisma](src/database/schema.prisma) to use a different type of database, this should be a [MongoDB URL](https://www.mongodb.com/docs/manual/reference/connection-string/).
   3. `CLIENT_ID` Discord bot client ID (acquired in step 1).
   4. `TEST_GUILD_ID` guild ID of the server you will use to test this bot.
      - Slash commands will *immediately* be updated for this server and this server only upon restarting the bot in *developer mode*.
   5. `DEV_IDS` A list of developer discord user IDs (must set *at least* one)

      - IDs should be separated by `", "`. Ex: `DEV_IDS = DEV_ID1, DEV_ID2, DEV_ID3`.

5. Run `npm ci` to do a clean install of dependencies and generate Prisma client files.

6. Run `npm run dev` to start a developer environment instance!
   - Edit *and* save any of the files in the `src` directory (with the exception of [src/database/schema.prisma](src/database/schema.prisma)) and the program will automatically restart to reflect the changes!

### Production environment

1. Follow steps 1 and 2 from [Development environment](#development-environment).

2. Download or clone this repository.

3. Rename `sample-production.env` to `production.env` and set the environment variables as defined in [src/global.d.ts](src/global.d.ts)

   > Note that **all** the environment variables are strings.

   1. `DISCORD_TOKEN`: Discord bot token (acquired in step 1).

   2. `DB_URL` Database URL

      - Unless you modified [src/database/schema.prisma](src/database/schema.prisma) to use a different type of database, this should be a [MongoDB URL](https://www.mongodb.com/docs/manual/reference/connection-string/).

   3. `CLIENT_ID` Discord bot client ID (acquired in step 1).

4. Run `npm ci` to do a clean install of dependencies and generate Prisma client files.

5. Run `npm run build` to compile the source code for production.

   - If you are tight on storage space, delete the `node_modules` folder after running the above command. Then, run `npm ci --production` to install only the dependencies needed for production.

6. **If this is the first time you have run the bot** or **you are updating the source code**, run `npm run registerGlobal` to register all your commands to any and all servers this bot is in.

7. Run `npm start` to run the bot!

   > Add [PM2](https://www.npmjs.com/package/pm2) or containerize with [Docker](https://docs.docker.com/). Then, deploy to a cloud service ([Heroku](https://www.heroku.com/), [Linode](https://www.linode.com/), etc.) or on your own hardware.
