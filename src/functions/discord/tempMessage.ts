import type { ChatInputCommandInteraction, Message } from "discord.js";

import logger from "../../logger.js";
import { isNaturalNumber } from "../general/math.js";
import sleep from "../general/sleep.js";

/**
 * @param showCountdown [default: true] Don't display countdown
 * @param durationInSeconds [default: 10] Countdown duration in seconds
 * @param countdownIntervalInSeconds [default: 2] Second interval between updates to the countdown
 */
export interface TempMessageOptions {
  showCountdown: boolean;
  durationInSeconds: number;
  countdownIntervalInSeconds: number;
}

/**
 * Send a temporary message with content `text` to the channel that `interaction` is in.
 *
 * @param interaction
 * @param text
 * @param options see {@link TempMessageOptions}
 */
export default async (
  interaction: ChatInputCommandInteraction,
  text: string,
  options: Partial<TempMessageOptions> = {}
) => {
  const showCountdown = options.showCountdown ?? true;
  const durationInSeconds = options.durationInSeconds ?? 10;
  const countdownIntervalInSeconds = options.countdownIntervalInSeconds ?? 2;

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
    const newText = `${text}...`;
    const message = await interaction.followUp({
      content: newText + durationInSeconds.toString(),
    });

    logger.verbose(durationInSeconds);

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
  await sleep(1000 * countdownIntervalInSeconds);
  const tempMsg = await tempMessage.edit({ content: newText + t.toString() });

  if (t <= 0) {
    await tempMsg.delete();
  } else {
    // Tick the interval
    const newT = t - countdownIntervalInSeconds;
    logger.verbose(t);

    await countdown(newT, countdownIntervalInSeconds, tempMsg, newText);
  }
}
