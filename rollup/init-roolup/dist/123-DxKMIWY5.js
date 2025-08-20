const randomNumber = (minNum, maxNum) => {
	const min = Math.ceil(minNum);
	const max = Math.floor(maxNum);

	return Math.floor(Math.random(max - min + 1)) * min
};

export { randomNumber as r };
