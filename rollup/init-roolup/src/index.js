import { randomNumber } from './utils'
import { chunk } from 'lodash-es'

const test = chunk([1,2,3,4,5,6,7], 2)
console.log(test)

const r = randomNumber(1, 10)
console.log(r)

export default { randomNumber }