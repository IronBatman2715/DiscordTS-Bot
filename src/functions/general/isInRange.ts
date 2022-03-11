/**
 * Evaluate if `value` is between `min` and `max` (inclusive).
 *
 * @param min [default: 1]
 * @param max [default: `Number.MAX_SAFE_INTEGER` = `9007199254740991`]
 */
export default (value: number, min = 1, max = Number.MAX_SAFE_INTEGER): boolean => {
	if (min > max) {
		console.error("isInRange function received a min that was larger than max! Outputting false.");
		return false;
	}

	return min <= value && value <= max;
};
