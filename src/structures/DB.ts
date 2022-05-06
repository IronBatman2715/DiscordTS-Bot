import { PrismaClient } from "@prisma/client";
import type { GuildConfig } from "@prisma/client";

import { guildConfigDefaults } from "../resources/data/database/GuildConfig";

const prisma = new PrismaClient({
  log: [
    { emit: "event", level: "error" },
    { emit: "event", level: "info" },
    { emit: "event", level: "query" },
    { emit: "event", level: "warn" },
  ],
});

export default class DB {
  static prisma = prisma;

  /** Connects to MongoDB server with `DB_URL` environment variable */
  async connect() {
    try {
      await DB.prisma.$connect();
    } catch (error) {
      console.error(error);
    }
  }

  async disconnect() {
    try {
      await DB.prisma.$disconnect();
      console.log("Disconnected from DB!");
    } catch (error) {
      console.error(error);
    }
  }

  /** Get the guild config data corresponding to guildId. If does not exist, generate based on defaults! */
  async getGuildConfig(guildId: string | null) {
    if (typeof guildId !== "string") throw `Entered invalid guildId [{${typeof guildId}} guildId: ${guildId}]!`;

    const query = await DB.prisma.guildConfig.findUnique({ where: { guildId } });

    if (query) return query;

    //Could not find match, creating a new one
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
  async updateGuildConfig(guildId: string | null, guildConfig: Partial<GuildConfig>) {
    if (guildId === null) throw `Entered invalid guildId [{${typeof guildId}} guildId: ${guildId}]!`;

    return await DB.prisma.guildConfig.update({
      where: { guildId },
      data: guildConfig,
    });
  }

  /** Delete the guild config document corresponding to guildId. */
  async deleteGuildConfig(guildId: string | null) {
    if (guildId === null) throw `Entered invalid guildId [{${typeof guildId}} guildId: ${guildId}]!`;

    return await DB.prisma.guildConfig.delete({ where: { guildId } });
  }
}
