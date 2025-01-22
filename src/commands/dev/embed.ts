import type { GuildMember } from "discord.js";
import { Colors, SlashCommandBuilder, User } from "discord.js";

import Command from "../../structures/Command.js";

export default new Command(
  new SlashCommandBuilder().setName("embed").setDescription("DEVELOPER ONLY: Shows a test embed."),

  async (client, interaction) => {
    const channelName = (await interaction.guild?.channels.fetch(interaction.channelId))?.name ?? "CHANNEL_NAME";

    let userDisplayName = "USER_DISPLAY_NAME";
    // Should always be true, but just in case
    if (interaction.member.user instanceof User) {
      userDisplayName = interaction.member.user.displayName;
    }

    const testEmbed = client.genEmbed({
      title: `Test embed`,
      description: `Title link points to information about embeds!`,
      url: "https://discordjs.guide/popular-topics/embeds.html",
      timestamp: interaction.createdTimestamp,
      color: Colors.DarkBlue,
      fields: [
        {
          name: "Test field name",
          value: "Test field value",
          inline: false,
        },
        {
          /** Reminder that channels, users, roles, and other links will ONLY link properly inside
           * embed field values or the embed's description
           */
          name: `Test channel field name: ${channelName}`,
          value: `Test channel field value: ${channelName}`,
          inline: false,
        },
      ],
      author: {
        name: userDisplayName,
        url: "https://ironbatman2715.github.io/",
        iconURL: (interaction.member as GuildMember).avatarURL() ?? "",
      },
      thumbnail: {
        url: "https://www.seoptimer.com/blog/wp-content/uploads/2018/09/image22.png", //youtube icon
      },
      image: {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/U%2B2160.svg/1200px-U%2B2160.svg.png", //letter I
      },
      footer: {
        text: client.config.name,
      },
    });

    await interaction.followUp({
      embeds: [testEmbed],
    });
  }
);
