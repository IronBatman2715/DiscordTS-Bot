import type { CacheType, ChatInputCommandInteraction, Message } from "discord.js";

import logger from "../../logger";
import { isNaturalNumber } from "../general/math";
import sleep from "../general/sleep";

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
  interaction: ChatInputCommandInteraction<CacheType>,
  text: string,
  showCountdown = true,
  durationInSeconds = 10,
  countdownIntervalInSeconds = 2
) => {
  if (!isNaturalNumber(durationInSeconds)) {
    throw new RangeError(
      "tempMessage called with an invalid duration. Must be an integer greater than 0. Not sending message."
    );
  }
  if (!isNaturalNumber(countdownIntervalInSeconds) || countdownIntervalInSeconds >= durationInSeconds) {
    throw new RangeError(
      "tempMessage called with an invalid countdown interval. Must be an integer greater than 0 AND smaller than the duration. Not sending message."
    );
  }

  logger.verbose("Ticking tempMessage", { interaction, text });
  if (showCountdown) {
    // Show countdown to when message will delete itself
    const newText = text + `...`;
    const message = await interaction.followUp({
      content: newText + durationInSeconds.toString(),
    });

    logger.verbose(durationInSeconds);

    await sleep(1000 * countdownIntervalInSeconds);
    await countdown(durationInSeconds - countdownIntervalInSeconds, countdownIntervalInSeconds, message, newText);
  } else {
    // No visible countdown to when message will delete itself
    const message = await interaction.followUp({ content: text });

    await sleep(1000 * durationInSeconds);
    await message.delete();
  }
  logger.verbose("Done ticking tempMessage!");
};

async function countdown(t: number, countdownIntervalInSeconds: number, tempMessage: Message, newText: string) {
  const tempMsg = await tempMessage.edit({ content: newText + t.toString() });

  if (t <= 0) {
    await tempMsg.delete();
  } else {
    // Tick the interval
    const newT = t - countdownIntervalInSeconds;
    logger.verbose(t);

    await sleep(1000 * countdownIntervalInSeconds);
    await countdown(newT, countdownIntervalInSeconds, tempMsg, newText);
  }
}
