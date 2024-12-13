import { isNaturalNumber } from "./math.js";

/** Sleep the program for the specified number of milliseconds
 *
 *  ms value MUST be a natural number!
 */
export default (ms: number): Promise<void> => {
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  if (!isNaturalNumber(ms)) throw new RangeError(`Called sleep function with an invalid time: ${ms} ms`);

  return new Promise((resolve) => setTimeout(resolve, ms));
};
