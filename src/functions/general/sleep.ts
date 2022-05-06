export default (ms: number): Promise<void> => {
  if (!Number.isInteger(ms) || ms < 0) throw `Called sleep function with an invalid time: ${ms} ms`;

  return new Promise((resolve) => setTimeout(resolve, ms));
};
