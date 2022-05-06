import type { Message, CommandInteraction, CacheType } from "discord.js";

/**
 * Send a temporary message with content `text` to the channel that `interaction` is in.
 *
 * @param interaction
 * @param text
 * @param showCountdown [default: true] Don't display countdown
 * @param durationInSeconds [default: 10] Countdown duration in seconds
 * @param countdownIntervalInSeconds [default: 2] Second interval between updates to the countdown
 */
export default async (
  interaction: CommandInteraction<CacheType>,
  text: string,
  showCountdown = true,
  durationInSeconds = 10,
  countdownIntervalInSeconds = 2
) => {
  if (durationInSeconds <= 0) {
    throw "tempMessage called with non-positive duration.";
  }
  if (!Number.isInteger(durationInSeconds) || !Number.isInteger(countdownIntervalInSeconds)) {
    throw "tempMessage called with non-integer duration OR countdown interval, not sending message.";
  }

  try {
    //console.log("Ticking tempMessage");
    if (showCountdown) {
      //Show countdown to when message will delete itself
      const newText = text + `...`;
      const message = (await interaction.followUp({
        content: newText + durationInSeconds.toString(),
      })) as Message;

      setTimeout(() => {
        countdown(durationInSeconds - countdownIntervalInSeconds, countdownIntervalInSeconds, message, newText);
      }, 1000 * countdownIntervalInSeconds);
    } else {
      //No visible countdown to when message will delete itself
      const message = (await interaction.followUp({ content: text })) as Message;

      setTimeout(() => {
        message.delete();
      }, 1000 * durationInSeconds);
    }
    //console.log("Done ticking tempMessage!");
  } catch (error) {
    console.error(error);
  }
};

async function countdown(t: number, countdownIntervalInSeconds: number, tempMessage: Message, newText: string) {
  const tempMsg = await tempMessage.edit({ content: newText + t.toString() });

  if (t <= 0) {
    await tempMsg.delete();
    return;
  } else {
    setTimeout(() => {
      countdown(t - countdownIntervalInSeconds, countdownIntervalInSeconds, tempMsg, newText);
    }, 1000 * countdownIntervalInSeconds);
  }
}
