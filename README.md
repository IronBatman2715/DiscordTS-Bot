# DiscordTS-Bot

[![](https://img.shields.io/github/license/IronBatman2715/DiscordTS-Bot.svg?branch=main)](https://github.com/IronBatman2715/DiscordTS-Bot/blob/main/LICENSE)

A customizable Discord bot based on [discord.js v14](https://discord.js.org) with [Typescript](https://www.typescriptlang.org/)!

- Bring music to your servers with the included [Discord player](https://discord-player.js.org) library!

- Persist settings for each discord server/guild with [MongoDB](https://www.mongodb.com/), managed by [Prisma](https://www.prisma.io) (code can be modified to use [other databases supported by Prisma](https://www.prisma.io/docs/reference/database-reference/supported-databases)).

- Easy troubleshooting with [Winston](https://github.com/winstonjs/winston) logging.

- Configure the bot with the `config.json` file. Real-time validation with [AJV](https://ajv.js.org/)

---

## Setup

1. Install the following software.

- [Node.js](https://nodejs.org/) 20.18.1 or higher
- [FFMPEG](https://ffmpeg.org/)
- If downloading using Git (clone/fork): [Git-LFS](https://git-lfs.com/)

2. Create your bot application on the [Discord developer portal](https://discord.com/developers/applications)

   - Refer to the [discord.js guide](https://discordjs.guide) for directions. Specifically: [setting up your bot application](https://discordjs.guide/preparations/setting-up-a-bot-application) and then [adding it to server(s)](https://discordjs.guide/preparations/adding-your-bot-to-servers).

   > It is recommended to use separate discord bot applications for development and production. This is for security reasons and because it can be difficult to differentiate global commands from in development commands otherwise.

3. Setup your database of choice.

   - MongoDB is the default. You can easily set up a free instance with [MongoDB Atlas](https://www.mongodb.com/atlas).

   - If you want to use a different database, see [here](https://www.prisma.io/docs/reference/database-reference/supported-databases) for databases supported by Prisma. This will also require some changes to [`prisma/schema.prisma`](prisma/schema.prisma).

4. Download this repository (clone/fork/raw download).

From here, follow the steps for your desired setup:

- [Development environment](#development-environment).
- [Production environment](#production-environment).

### Development environment

5. Rename `sample.development.env` to `development.env` and set the environment variables as defined in [`src/global.d.ts`](src/global.d.ts)

   - `DISCORD_TOKEN`: Discord bot token (acquired in step 1).

   - `DB_URL` Database URL

     - Unless you modified [`prisma/schema.prisma`](prisma/schema.prisma) to use a different type of database, this should be a [MongoDB URL](https://www.mongodb.com/docs/manual/reference/connection-string/).

   - `CLIENT_ID` Discord bot client ID (acquired in step 1).

   - `TEST_GUILD_ID` guild ID of the server you will use to test this bot.

     - Slash commands will _immediately_ be updated for this server and this server only upon restarting the bot in _developer mode_.

   - `DEV_IDS` A list of developer discord user IDs (must set _at least_ one)

     - IDs should be separated by `", "`. Ex: `DEV_IDS='DEV_ID1, DEV_ID2, DEV_ID3'`.

6. Run `npm ci` to do a clean install of dependencies and generate Prisma client files.

7. Run `npm run dev` to start a developer environment instance!

   - Edit _and_ save any of the files in the `src` directory (with the exception of [`prisma/schema.prisma`](prisma/schema.prisma)) and the program will automatically restart to reflect the changes!

### Production environment

5. Rename `sample.env` to `.env` and set the environment variables as defined in [`src/global.d.ts`](src/global.d.ts)

   - `DISCORD_TOKEN`: Discord bot token (acquired in step 1).

   - `DB_URL` Database URL

     - Unless you modified [`prisma/schema.prisma`](prisma/schema.prisma) to use a different type of database, this should be a [MongoDB URL](https://www.mongodb.com/docs/manual/reference/connection-string/).

   - `CLIENT_ID` Discord bot client ID (acquired in step 1).

6. Run `npm ci` to do a clean install of dependencies and generate Prisma client files.

7. Run `npm run build` to compile the source code for production.

   - If you are tight on storage space, delete the `node_modules` folder _after_ running `npm run build`. Then, run `npm ci --production` to install only the dependencies needed for production.

8. Change the `config.json` file to your liking. See information about how you can change it [here](#configuration-file-properties).

   > This file is generated by the previous step.

9. **If this is the first time you have run the bot** or **you are updating the source code**, run `npm run commands:register` to register all your commands to any and all servers this bot is in. You may need to run `npm run commands:resetProd` prior to `npm run commands:register` if some old commands are not being removed.

10. Run `npm start` to run the bot!

11. [Optional] Add [PM2](https://www.npmjs.com/package/pm2) or containerize with [Docker](https://docs.docker.com/). Then, deploy to a cloud service ([Heroku](https://www.heroku.com/), [Linode](https://www.linode.com/), [Vultr](https://www.vultr.com/), etc.) or on your own hardware.

## Configuration file properties

- `name`: name of the bot (displayed in some commands).

- `activities`: list of activities the bot will randomly cycle through as its current activity (Exs: "Watching The Fellowship of the Ring", "Listening to Never Gonna Give you Up", etc.).

  - `type`: integer that can _only_ be one of the following values.

    `0` = PLAYING

    `1` = STREAMING

    `2` = LISTENING

    `3` = WATCHING

    `4` = **\*\*NOT VALID, DO NOT USE\*\***

    `5` = COMPETING

  - `name`: string after the `type`.

## References

I did not create the icons used. They are sourced from [here](https://pixabay.com/illustrations/icons-web-development-website-design-2188729/) under [their license](https://pixabay.com/service/license/).
