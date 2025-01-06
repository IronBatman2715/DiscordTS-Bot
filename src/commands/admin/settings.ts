import { QueueRepeatMode } from "discord-player";
import type { ChatInputCommandInteraction, EmbedField } from "discord.js";
import { SlashCommandBuilder } from "discord.js";
import lodash from "lodash";

import {
  deleteGuildConfig,
  getGuildConfig,
  defaults as guildConfigDefaults,
  descriptions as guildConfigDescriptions,
  updateGuildConfig,
} from "../../database/GuildConfig.js";
import { isQueueRepeatMode, toDisplayString } from "../../functions/music/queueRepeatMode.js";
import logger from "../../logger.js";
import type Client from "../../structures/Client.js";
import Command from "../../structures/Command.js";

// eslint-disable-next-line @typescript-eslint/unbound-method
const { kebabCase, camelCase } = lodash;

/** Omit `greetings` from `GuildConfig` */
const guildConfigSettings = Object.keys(guildConfigDefaults).filter((setting) => setting !== "greetings");

// Base slash command builder
const builder = new SlashCommandBuilder()
  .setName("settings")
  .setDescription("ADMIN ONLY: " + "Change/view guild settings.")
  .addSubcommand((option) =>
    option.setName("display").setDescription("ADMIN ONLY: " + "Show current settings for this guild/server.")
  )
  .addSubcommand((option) =>
    option
      .setName("reset")
      .setDescription("ADMIN ONLY: " + "Resets this guild/server's settings to the default values!")
  );

// Add settings
builder
  // maxMessagesCleared
  .addSubcommand((option) =>
    option
      .setName(kebabCase(guildConfigSettings[0]))
      .setDescription("ADMIN ONLY: " + guildConfigDescriptions[guildConfigSettings[0]])
      .addIntegerOption((subOption) =>
        subOption
          .setName("new-value")
          .setDescription("Enter a new value.")
          .setMinValue(2)
          .setMaxValue(100)
          .setRequired(true)
      )
  )
  // musicChannelId
  .addSubcommandGroup((groupOption) =>
    groupOption
      .setName(kebabCase(guildConfigSettings[1]))
      .setDescription(guildConfigDescriptions[guildConfigSettings[1]])
      .addSubcommand((option) =>
        option
          .setName("overwrite")
          .setDescription("ADMIN ONLY: " + "Overwrite current value with a new one.")
          .addChannelOption((subOption) =>
            subOption.setName("new-value").setDescription("Enter a new value.").addChannelTypes(0).setRequired(true)
          )
      )
      .addSubcommand((option) =>
        option.setName("disable").setDescription("ADMIN ONLY: " + "Disable this setting (set to an empty value).")
      )
  )
  // defaultRepeatMode
  .addSubcommand((option) =>
    option
      .setName(kebabCase(guildConfigSettings[2]))
      .setDescription("ADMIN ONLY: " + guildConfigDescriptions[guildConfigSettings[2]])
      .addIntegerOption((subOption) =>
        subOption
          .setName("new-value")
          .setDescription("Enter a new value.")
          .setRequired(true)
          .addChoices(
            { name: "OFF", value: QueueRepeatMode.OFF },
            { name: "TRACK", value: QueueRepeatMode.TRACK },
            { name: "QUEUE", value: QueueRepeatMode.QUEUE },
            { name: "AUTOPLAY", value: QueueRepeatMode.AUTOPLAY }
          )
      )
  );

export default new Command(builder, async (client, interaction) => {
  const subCommandQuery = interaction.options.getSubcommand(false);
  const subCommandGroupQuery = interaction.options.getSubcommandGroup(false);

  // Check subcommand groups (For now, this can only be "music-channel-id")
  switch (subCommandGroupQuery) {
    case "music-channel-id": {
      logger.verbose(`Changing "${subCommandGroupQuery}" setting`);
      const name = camelCase(subCommandGroupQuery);
      switch (subCommandQuery) {
        case "overwrite": {
          await changeSetting(interaction, {
            name,
            value: interaction.options.getChannel("new-value", true).id,
          });
          break;
        }

        case "disable": {
          await changeSetting(interaction, {
            name,
            value: "",
          });
          break;
        }

        default: {
          throw new ReferenceError(`Could not match subcommand within "music-channel-id" subcommand group`);
        }
      }
      return;
    }
  }

  // Check subcommands
  switch (subCommandQuery) {
    case "display": {
      logger.verbose("Displaying current settings");
      await displayCurrentSettings(client, interaction);
      break;
    }

    case "reset": {
      // Add in user confirmation..?
      logger.verbose("Resetting guild settings to defaults");
      await resetSettings(interaction);
      break;
    }

    case "max-messages-cleared":
    case "default-repeat-mode": {
      logger.verbose(`Changing "${subCommandQuery}" setting`);
      await changeSetting(interaction, {
        name: camelCase(subCommandQuery),
        value: interaction.options.getInteger("new-value", true),
      });
      break;
    }

    default: {
      throw new ReferenceError("Could not parse the command the user entered!");
    }
  }
});

interface SettingData {
  /** Name of setting in camel-case */
  name: string;
  value: number | string;
}

interface SettingDisplay {
  /** Name of setting in kebab-case */
  name: string;
  /** Value represented as a string */
  value: string;
}

async function displayCurrentSettings(client: Client, interaction: ChatInputCommandInteraction) {
  const currentGuildConfig = await getGuildConfig(interaction.guildId);

  const settingsFieldArr: EmbedField[] = guildConfigSettings.map((setting) => {
    let currentValue: number | string;
    const value = currentGuildConfig[setting as keyof typeof guildConfigDefaults];

    if (Array.isArray(value)) {
      const array = value;
      currentValue = "[ ";

      for (let i = 0; i < array.length; i++) {
        currentValue = currentValue + array[i];
        if (i !== array.length - 1) {
          currentValue = currentValue + ", ";
        }
      }

      currentValue = currentValue + " ]";
    } else {
      currentValue = value;
    }

    const settingData: SettingData = {
      name: setting,
      value: currentValue,
    };

    const settingDisplay: SettingDisplay = {
      name: kebabCase(settingData.name),
      value: getSettingDisplayValue(settingData),
    };

    return {
      name: `${settingDisplay.name}: \`${settingDisplay.value}\``,
      value: guildConfigDescriptions[settingData.name],
      inline: false,
    };
  });

  await client.sendMultiPageEmbed(interaction, settingsFieldArr, {
    maxFieldsPerEmbed: 15,
    otherEmbedData: {
      title: `${interaction.guild?.name} [id: \`${interaction.guildId}\`] Server-wide Settings`,
      thumbnail: {
        url: "attachment://settings.png",
      },
    },
    otherReplyOptions: { files: ["assets/icons/settings.png"] },
  });
}

async function resetSettings(interaction: ChatInputCommandInteraction) {
  // Reset
  await deleteGuildConfig(interaction.guildId);

  // Generate new based on defaults
  await getGuildConfig(interaction.guildId);

  await interaction.followUp({
    content: `Reset guild/server settings to defaults!`,
  });
}

async function changeSetting(interaction: ChatInputCommandInteraction, newSettingData: SettingData) {
  await updateGuildConfig(interaction.guildId, {
    [newSettingData.name]: newSettingData.value,
  });

  const newSettingDisplay: SettingDisplay = {
    name: kebabCase(newSettingData.name),
    value: getSettingDisplayValue(newSettingData),
  };

  await interaction.followUp({
    content: `Changed \`${newSettingDisplay.name}\` value to \`${newSettingDisplay.value}\``,
  });
}

function getSettingDisplayValue(settingData: SettingData): string {
  switch (settingData.name) {
    case "defaultRepeatMode": {
      if (typeof settingData.value !== "number") throw new TypeError("settingData.value must be of type 'number'");
      if (!isQueueRepeatMode(settingData.value))
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        throw new TypeError(`Invalid QueueRepeatMode value: "${settingData.value}"`);

      return `\`${toDisplayString(settingData.value)}\``;
    }

    default: {
      return `\`${settingData.value.toString()}\``;
    }
  }
}
