
export const randomNumber = (minNum, maxNum) => {
	const min = Math.ceil(minNum)
	const max = Math.floor(maxNum)

	return Math.floor(Math.random(max - min + 1)) * min
}



export const deepClone = (obj) => {
	if(typeof obj !== 'object' || obj === null) {
		return obj
	}

	const result = Array.isArray(obj) ? [] : {}

	for (const key in obj) {
		if (Object.prototype.hasOwnProperty.call(obj, key)) {
			const element = object[key];
			result[key] = deepClone(element)
		}
	}

	return result
}
