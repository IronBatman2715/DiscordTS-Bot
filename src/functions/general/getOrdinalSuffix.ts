import logger from "../../logger";

export default (num: number) => {
  if (num < 1 || !Number.isInteger(num)) {
    logger.error("getOrdinalSuffix received an invalid number! Returning `th`.");
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
