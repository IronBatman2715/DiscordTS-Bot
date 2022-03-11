/** kebab-case => kebabCase */
export default (str: string): string => {
	return str
		.split("-") //split into sub-strings by dashes
		.map((subStr, i) => {
			if (i === 0) return subStr;
			return subStr.charAt(0).toUpperCase() + subStr.slice(1);
		})
		.join(""); //join substrings array back into string
};
