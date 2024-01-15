/** camelCase => Camel Case */
export function camel2Display(str: string): string {
  return str
    .split("") //split into character array
    .map((char, i) => {
      if (i === 0) return char.toUpperCase(); //set first character to uppercase
      if (char.toUpperCase() === char && char.toLowerCase() !== char) return ` ${char}`; //start of new word, add space
      return char;
    })
    .join(""); //join character array back into string
}

/** camelCase => camel-case */
export function camel2Kebab(str: string): string {
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
}

/** kebab-case => kebabCase */
export function kebab2Camel(str: string): string {
  return str
    .split("-") //split into sub-strings by dashes
    .map((subStr, i) => {
      if (i === 0) return subStr;
      return subStr.charAt(0).toUpperCase() + subStr.slice(1);
    })
    .join(""); //join substrings array back into string
}

/** snake_case => Snake case */
export function snake2Display(str: string): string {
  return str
    .split("") //split into character array
    .map((char) => {
      if (char === "_") return " "; //change underscore into space
      return char;
    })
    .join(""); //join character array back into string
}
