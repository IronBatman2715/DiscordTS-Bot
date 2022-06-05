/** camelCase => camel-case */
export default (str: string): string => {
  return str
    .split("") //split into character array
    .map((char) => {
      // start of new word, add dash and make lowercase
      if (char.toUpperCase() === char && char.toLowerCase() !== char) {
        return `-${char.toLowerCase()}`;
      }
      return char;
    })
    .join(""); //join character array back into string
};
