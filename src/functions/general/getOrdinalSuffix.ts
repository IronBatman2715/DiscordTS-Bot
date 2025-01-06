import logger from "../../logger.js";
import { isNaturalNumber } from "./math.js";

const enOrdinalRules = new Intl.PluralRules("en", { type: "ordinal" });
const suffixes = {
  one: "st",
  two: "nd",
  few: "rd",
  other: "th",
};

/** Get the ordinal suffix corresponding to the entered natural number.
 *
 *  Ex:
 *  - 1 -> "st"
 *  - 102 -> "nd"
 *  - 23 -> "rd"
 *  - 11 -> "th"
 */
export default (num: number): string => {
  if (!isNaturalNumber(num)) {
    logger.warn(new RangeError(`getOrdinalSuffix received an invalid number! Returning "th".`));
    return "th";
  }

  const category = enOrdinalRules.select(num);

  if (category === "zero" || category === "many") {
    logger.warn(
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      new Error(`getOrdinalSuffix received an unexpected ordinal rule (${num} -> ${category})! Returning "th".`)
    );
    return "th";
  }

  return suffixes[category];
};
