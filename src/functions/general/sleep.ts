import { isNaturalNumber } from "./math";

export default (ms: number): Promise<void> => {
  if (!isNaturalNumber(ms)) throw new RangeError(`Called sleep function with an invalid time: ${ms} ms`);

  return new Promise((resolve) => setTimeout(resolve, ms));
};
