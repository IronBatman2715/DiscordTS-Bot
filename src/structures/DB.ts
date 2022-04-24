import mongoose from "mongoose";

import { GuildConfig, GuildConfigModel } from "../resources/data/mongoModels/GuildConfig";

export default class DB {
  /** Connects to MongoDB server with `DB_TOKEN` environment variable */
  async connect() {
    try {
      if (process.env.DB_TOKEN === undefined) throw "DISCORD_TOKEN environment variable was not set!";

      await mongoose.connect(process.env.DB_TOKEN);
    } catch (error) {
      console.error(error);
    }
  }

  validateGuildId(guildId: string | null): void {
    if (typeof guildId !== "string") throw `Entered invalid guildId [{${typeof guildId}} guilId: ${guildId}]!`;
  }

  /** Get the guild config data corresponding to guildId. If does not exist, generate based on defaults! */
  async getGuildConfig(guildId: string | null): Promise<GuildConfig> {
    this.validateGuildId(guildId);

    try {
      const guildConfigSearch = await GuildConfigModel.find({
        guildId,
      });

      switch (guildConfigSearch.length) {
        //Guild config document does not exist yet
        case 0: {
          //console.log("Guild config document not present. Generating one with the default values!");

          //Create new
          const guildConfigDefault = new GuildConfigModel({
            guildId,
          });

          //Save to DB
          const guildConfigNew = await guildConfigDefault.save();

          //console.log("New document matching current guildId: ", guildConfigNew);
          return guildConfigNew.toObject();
        }
        case 1: {
          return guildConfigSearch[0].toObject();
        }

        default: {
          throw `Found multiple config documents for a server [guilId: ${guildId}]!`;
        }
      }
    } catch (error) {
      console.error(error);
      throw `Errored fetching GuildConfig for guildId: ${guildId}!`;
    }
  }

  /** Update the guild config document corresponding to guildId with the data in guildConfig. */
  async updateGuildConfig(guildId: string | null, guildConfig: Partial<GuildConfig>) {
    this.validateGuildId(guildId);

    return await GuildConfigModel.updateOne({ guildId }, guildConfig).catch((error) => console.error(error));
  }

  /** Delete the guild config document corresponding to guildId. */
  async deleteGuildConfig(guildId: string | null) {
    this.validateGuildId(guildId);

    return await GuildConfigModel.deleteOne({ guildId }).catch((error) => console.error(error));
  }
}
