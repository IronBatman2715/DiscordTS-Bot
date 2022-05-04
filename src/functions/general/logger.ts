export default (...entries: string[] | number[]): void => {
  entries.forEach((entry: string | number) => process.stdout.write(entry as string));
};
