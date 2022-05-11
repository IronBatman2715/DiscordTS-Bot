import logger from "../../logger";
import { isNaturalNumber } from "./math";

export default (num: number) => {
  if (!isNaturalNumber(num)) {
    logger.warn(new RangeError("getOrdinalSuffix received an invalid number! Returning `th`."));
    return "th";
  }

  switch (num) {
    case 1: {
      return "st";
    }
    case 2: {
      return "nd";
    }
    case 3: {
      return "rd";
    }
    default: {
      return "th";
    }
  }
};
