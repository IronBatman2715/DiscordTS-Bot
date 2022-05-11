import { PrismaClient } from "@prisma/client";
import type { GuildConfig } from "@prisma/client";

import type Client from "./Client";
import type { PrismaEvents, PrismaRunFunction } from "./Event";
import { guildConfigDefaults } from "../database/GuildConfig";
import logger from "../logger";

const prisma = new PrismaClient({
  log: [
    { emit: "event", level: "error" },
    { emit: "event", level: "info" },
    { emit: "event", level: "query" },
    { emit: "event", level: "warn" },
  ],
});

export default class DB {
  private static prisma = prisma;
  private static dbHandlerExists = false;
  client: Client;
  private hasDoneInitialConnection: boolean;

  constructor(client: Client) {
    this.client = client;

    if (DB.dbHandlerExists) throw "Should only instantiate DB once, as only one DB handler is required!";
    DB.dbHandlerExists = true;

    this.hasDoneInitialConnection = false;
  }

  /** Connects to database with `DB_URL` environment variable specified in schema.prisma file.
   *
   * Should NOT need to call this method (see {@link https://www.prisma.io/docs/concepts/components/prisma-client/working-with-prismaclient/connection-management#connect here})
   */
  async connect() {
    if (!this.hasDoneInitialConnection) {
      await DB.prisma.$connect();
      this.hasDoneInitialConnection = true;
      logger.info("Successfully completed initial connection to database");
    } else {
      logger.warn(
        "Do not need to explicitly connect to the database! Refer to: https://www.prisma.io/docs/concepts/components/prisma-client/working-with-prismaclient/connection-management#connect"
      );
    }
  }

  /** Disconnect from the database until next query/request
   *
   * Should NOT need to call this method (see {@link https://www.prisma.io/docs/concepts/components/prisma-client/working-with-prismaclient/connection-management#disconnect here})
   */
  async disconnect() {
    try {
      await DB.prisma.$disconnect();
      logger.info("Disconnected from DB!");
    } catch (error) {
      logger.error(error);
    }
  }

  bindEvent<Ev extends PrismaEvents>(event: Ev, eventFunction: PrismaRunFunction<Ev>) {
    DB.prisma.$on(event, eventFunction.bind(null, this.client));
  }

  /** Get the guild config data corresponding to guildId. If does not exist, generate based on defaults! */
  async getGuildConfig(guildId: string | null) {
    logger.verbose("DB.getGuildConfig()", guildId);

    if (typeof guildId !== "string") throw `Entered invalid guildId [{${typeof guildId}} guildId: ${guildId}]!`;

    const query = await DB.prisma.guildConfig.findUnique({ where: { guildId } });

    if (query) return query;

    logger.verbose("DB.getGuildConfig(): Could not find match, creating a new one");
    return await DB.prisma.guildConfig.create({
      data: {
        guildId,
        greetings: guildConfigDefaults.greetings,
        maxMessagesCleared: guildConfigDefaults.maxMessagesCleared,
        musicChannelId: guildConfigDefaults.musicChannelId,
        defaultRepeatMode: guildConfigDefaults.defaultRepeatMode,
      },
    });
  }

  /** Update the guild config document corresponding to guildId with the data in guildConfig. */
  async updateGuildConfig(guildId: string | null, guildConfig: Partial<Omit<GuildConfig, "id" | "guildId">>) {
    logger.verbose("DB.updateGuildConfig()", { guildId, guildConfig });

    if (guildId === null) throw `Entered invalid guildId [{${typeof guildId}} guildId: ${guildId}]!`;

    return await DB.prisma.guildConfig.update({
      where: { guildId },
      data: guildConfig,
    });
  }

  /** Delete the guild config document corresponding to guildId. */
  async deleteGuildConfig(guildId: string | null) {
    logger.verbose("DB.deleteGuildConfig()", guildId);

    if (guildId === null) throw `Entered invalid guildId [{${typeof guildId}} guildId: ${guildId}]!`;

    return await DB.prisma.guildConfig.delete({ where: { guildId } });
  }
}
