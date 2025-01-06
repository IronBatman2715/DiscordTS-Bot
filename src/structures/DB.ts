import type { GuildConfig } from "@prisma/client";
// import below force loads `.env` file if present AND `schema.prisma` refers to an environment variable that is unset
import { PrismaClient } from "@prisma/client";

import { guildConfigDefaults } from "../database/GuildConfig.js";
import type { PrismaEvents, PrismaRunFunction } from "./Event.js";
import logger from "./Logger.js";

const prisma = new PrismaClient({
  log: [
    { emit: "event", level: "error" },
    { emit: "event", level: "info" },
    { emit: "event", level: "query" },
    { emit: "event", level: "warn" },
  ],
});

let hasDoneInitialConnection = false;
/** Connects to database with `DB_URL` environment variable specified in `prisma/schema.prisma` file.
 *
 * Should NOT need to call this method (see {@link https://www.prisma.io/docs/concepts/components/prisma-client/working-with-prismaclient/connection-management#connect here})
 */
export async function connect() {
  if (!hasDoneInitialConnection) {
    logger.info("Initializing connection to database...");
    await prisma.$connect();
    hasDoneInitialConnection = true;
    logger.info("Successfully completed initial connection to database!");
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
export async function disconnect() {
  try {
    logger.info("Disconnecting from database...");
    await prisma.$disconnect();
    logger.info("Successfully disconnected from database!");
  } catch (error) {
    logger.error(error);
    logger.error(new Error("Errored trying to disconnect from database!"));
  }
}

export function bindEvent<Ev extends PrismaEvents>(event: Ev, eventFunction: PrismaRunFunction<Ev>) {
  prisma.$on(event, eventFunction);
}

/** Get the guild config data corresponding to guildId. If does not exist, generate based on defaults! */
export async function getGuildConfig(guildId: string | null) {
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
export async function updateGuildConfig(
  guildId: string | null,
  guildConfig: Partial<Omit<GuildConfig, "id" | "guildId">>
) {
  logger.verbose("DB.updateGuildConfig()", { guildId, guildConfig });

  if (!guildId) throw new ReferenceError(`Entered invalid guildId [{${typeof guildId}} guildId: ${guildId}]!`);

  return await prisma.guildConfig.update({
    where: { guildId },
    data: guildConfig,
  });
}

/** Delete the guild config document corresponding to guildId. */
export async function deleteGuildConfig(guildId: string | null) {
  logger.verbose("DB.deleteGuildConfig()", { guildId });

  if (!guildId) throw new ReferenceError(`Entered invalid guildId [{${typeof guildId}} guildId: ${guildId}]!`);

  return await prisma.guildConfig.delete({ where: { guildId } });
}

export default { connect, disconnect, bindEvent, getGuildConfig, updateGuildConfig, deleteGuildConfig };
