// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default (...entries: any[]): void => {
  entries.forEach((entry) => process.stdout.write(entry as string));
};
