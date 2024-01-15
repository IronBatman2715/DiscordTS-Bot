import { isNaturalNumber } from "./math";

/** Sleep the program for the specified nunber of milliseconds
 *
 *  ms value MUST be a natural number!
 */
export default (ms: number): Promise<void> => {
  if (!isNaturalNumber(ms)) throw new RangeError(`Called sleep function with an invalid time: ${ms} ms`);

  return new Promise((resolve) => setTimeout(resolve, ms));
};
