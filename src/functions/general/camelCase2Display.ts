/** camelCase => Camel Case */
export default (str: string): string => {
  return str
    .split("") //split into character array
    .map((char, i) => {
      if (i === 0) return char.toUpperCase(); //set first character to uppercase
      if (char.toUpperCase() === char && char.toLowerCase() !== char) return ` ${char}`; //start of new word, add space
      return char;
    })
    .join(""); //join character array back into string
};
