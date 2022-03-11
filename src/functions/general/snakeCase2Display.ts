//snake_case => Snake case
export default (str: string): string => {
	return str
		.split("") //split into character array
		.map((char) => {
			if (char === "_") return " "; //change underscore into space
			return char;
		})
		.join(""); //join character array back into string
};
