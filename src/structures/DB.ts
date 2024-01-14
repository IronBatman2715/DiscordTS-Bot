import type { GuildConfig } from "@prisma/client";
import { PrismaClient } from "@prisma/client";

import { guildConfigDefaults } from "../database/GuildConfig";
import logger from "../logger";
import type { PrismaEvents, PrismaRunFunction } from "./Event";

const prisma = new PrismaClient({
  log: [
    { emit: "event", level: "error" },
    { emit: "event", level: "info" },
    { emit: "event", level: "query" },
    { emit: "event", level: "warn" },
  ],
});

export default class DB {
  /** Singleton instance */
  private static instance: DB;
  private hasDoneInitialConnection = false;

  /** Get/Generate singleton instance */
  static get() {
    if (!DB.instance) DB.instance = new this();
    return DB.instance;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  /** Connects to database with `DB_URL` environment variable specified in schema.prisma file.
   *
   * Should NOT need to call this method (see {@link https://www.prisma.io/docs/concepts/components/prisma-client/working-with-prismaclient/connection-management#connect here})
   */
  async connect() {
    if (!this.hasDoneInitialConnection) {
      await prisma.$connect();
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
      await prisma.$disconnect();
      logger.info("Disconnected from DB!");
    } catch (error) {
      logger.error(error);
      logger.error(new Error("Errored trying to disconnect from database!"));
    }
  }

  bindEvent<Ev extends PrismaEvents>(event: Ev, eventFunction: PrismaRunFunction<Ev>) {
    prisma.$on(event, eventFunction);
  }

  /** Get the guild config data corresponding to guildId. If does not exist, generate based on defaults! */
  async getGuildConfig(guildId: string | null) {
    logger.verbose("DB.getGuildConfig()", { guildId });

    if (!guildId) throw new ReferenceError(`Entered invalid guildId [{${typeof guildId}} guildId: ${guildId}]!`);

    const query = await prisma.guildConfig.findUnique({ where: { guildId } });

    if (query) return query;

    logger.verbose("DB.getGuildConfig(): Could not find match, creating a new one");
    return await prisma.guildConfig.create({
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

    if (!guildId) throw new ReferenceError(`Entered invalid guildId [{${typeof guildId}} guildId: ${guildId}]!`);

    return await prisma.guildConfig.update({
      where: { guildId },
      data: guildConfig,
    });
  }

  /** Delete the guild config document corresponding to guildId. */
  async deleteGuildConfig(guildId: string | null) {
    logger.verbose("DB.deleteGuildConfig()", { guildId });

    if (!guildId) throw new ReferenceError(`Entered invalid guildId [{${typeof guildId}} guildId: ${guildId}]!`);

    return await prisma.guildConfig.delete({ where: { guildId } });
  }
}
