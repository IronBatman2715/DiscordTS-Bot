import type { CacheType, CommandInteraction, EmbedField } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { RepeatMode } from "discord-music-player";

import type Client from "../../structures/Client";
import Command from "../../structures/Command";
import camelCase2KebabCase from "../../functions/general/camelCase2KebabCase";
import kebabCase2CamelCase from "../../functions/general/kebabCase2CamelCase";
import { guildConfigDefaults, guildConfigDescriptions } from "../../database/GuildConfig";

/** Omit `greetings` from `GuildConfig` */
const guildConfigSettings = Object.keys(guildConfigDefaults).filter((setting) => setting !== "greetings");

// Base slash command builder
const builder = new SlashCommandBuilder()
  .setName("settings")
  .setDescription("ADMIN ONLY: Change/view guild settings.")
  .addSubcommand((option) => option.setName("display").setDescription("Show current settings for this guild/server."))
  .addSubcommand((option) =>
    option.setName("reset").setDescription("Resets this guild/server's settings to the default values!")
  );

// Add settings
builder
  // maxMessagesCleared
  .addSubcommand((option) =>
    option
      .setName(camelCase2KebabCase(guildConfigSettings[0]))
      .setDescription(guildConfigDescriptions[guildConfigSettings[0]])
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
      .setName(camelCase2KebabCase(guildConfigSettings[1]))
      .setDescription(guildConfigDescriptions[guildConfigSettings[1]])
      .addSubcommand((option) =>
        option
          .setName("overwrite")
          .setDescription("Overwrite current value with a new one.")
          .addChannelOption((subOption) =>
            subOption.setName("new-value").setDescription("Enter a new value.").addChannelTypes(0).setRequired(true)
          )
      )
      .addSubcommand((option) =>
        option.setName("disable").setDescription("Disable this setting (set to an empty value).")
      )
  )
  // defaultRepeatMode
  .addSubcommand((option) =>
    option
      .setName(camelCase2KebabCase(guildConfigSettings[2]))
      .setDescription(guildConfigDescriptions[guildConfigSettings[2]])
      .addIntegerOption((subOption) =>
        subOption
          .setName("new-value")
          .setDescription("Enter a new value.")
          .setRequired(true)
          .addChoices(
            { name: "DISABLED", value: RepeatMode.DISABLED },
            { name: "SONG", value: RepeatMode.SONG },
            { name: "QUEUE", value: RepeatMode.QUEUE }
          )
      )
  );

export = new Command(builder, async (client, interaction) => {
  // Check for no user input subcommands
  switch (interaction.options.getSubcommand()) {
    // User wants to see current settings
    case "display": {
      return await displayCurrentSettings(client, interaction);
    }

    // User wants to reset settings
    case "reset": {
      // Add in user confirmation..?
      return await resetSettings(client, interaction);
    }
  }

  // User must have entered a change to a setting, proceed to find which one
  const newSettingData: SettingData = {
    name: "",
    value: "",
  };

  // Check subcommand groups (For now, this can only be music-channel-id)
  if (interaction.options.getSubcommandGroup(false) === "music-channel-id") {
    newSettingData.name = kebabCase2CamelCase(interaction.options.getSubcommandGroup(true));

    switch (interaction.options.getSubcommand(true)) {
      case "overwrite": {
        newSettingData.value = interaction.options.getChannel("new-value", true).id;

        return await changeSetting(client, interaction, newSettingData);
      }

      case "disable": {
        return await changeSetting(client, interaction, newSettingData);
      }

      // Could not match
      default: {
        throw new ReferenceError("Could not match subcommand within subcommand group");
      }
    }
  }

  // Interaction did not have a subcommand group, must be a single subcommand
  switch (interaction.options.getSubcommand()) {
    case "max-messages-cleared":
    case "default-repeat-mode": {
      newSettingData.name = kebabCase2CamelCase(interaction.options.getSubcommand());
      newSettingData.value = interaction.options.getInteger("new-value", true);

      return await changeSetting(client, interaction, newSettingData);
    }

    default: {
      throw new ReferenceError("Could not find the command the user entered!");
    }
  }
});

type SettingData = {
  /** Name of setting in camel-case */
  name: string;
  value: number | string;
};

type SettingDisplay = {
  /** Name of setting in kebab-case */
  name: string;
  /** Value represented as a string */
  value: string;
};

async function displayCurrentSettings(client: Client, interaction: CommandInteraction<CacheType>) {
  const currentGuildConfig = await client.DB.getGuildConfig(interaction.guildId);

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
      name: camelCase2KebabCase(settingData.name),
      value: getSettingDisplayValue(interaction, settingData),
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

async function resetSettings(client: Client, interaction: CommandInteraction<CacheType>) {
  // Reset
  await client.DB.deleteGuildConfig(interaction.guildId);

  // Generate new based on defaults
  await client.DB.getGuildConfig(interaction.guildId);

  return await interaction.followUp({
    content: `Reset guild/server settings to defaults!`,
  });
}

async function changeSetting(client: Client, interaction: CommandInteraction<CacheType>, newSettingData: SettingData) {
  await client.DB.updateGuildConfig(interaction.guildId, {
    [newSettingData.name]: newSettingData.value,
  });

  const newSettingDisplay: SettingDisplay = {
    name: camelCase2KebabCase(newSettingData.name),
    value: getSettingDisplayValue(interaction, newSettingData),
  };

  return await interaction.followUp({
    content: `Changed \`${newSettingDisplay.name}\` value to \`${newSettingDisplay.value}\``,
  });
}

function getSettingDisplayValue(interaction: CommandInteraction<CacheType>, settingData: SettingData): string {
  switch (settingData.name) {
    case "defaultRepeatMode": {
      if (typeof settingData.value !== "number") throw new TypeError("settingData.value must be of type 'number'");
      return `\`${RepeatMode[settingData.value]}\``;
    }

    default: {
      return `\`${settingData.value.toString()}\``;
    }
  }
}
