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

/** Test if a string contains *only* digits in base 10.
 *
 * Ex: "1234567890987654321"
 */
export function isOnlyDigits(str: string): boolean {
  return /^\d+$/.test(str);
}
