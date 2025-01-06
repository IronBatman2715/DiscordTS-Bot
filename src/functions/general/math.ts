import logger from "../../logger.js";

/**
 * Evaluate if `value` is between `min` and `max` (inclusive).
 *
 * @param min [default: 1]
 * @param max [default: `Number.MAX_SAFE_INTEGER` = `9007199254740991`]
 */
export const isInRange = (value: number, min = 1, max = Number.MAX_SAFE_INTEGER): boolean => {
  if (min > max) {
    logger.error(new RangeError("isInRange function received a min that was larger than max! Outputting false."));
    return false;
  }

  return min <= value && value <= max;
};

/** Evaluate if `value` is a natural number (1, 2, 3, 4...) */
export const isNaturalNumber = (value: number): boolean => {
  return Number.isInteger(value) && isInRange(value);
};
