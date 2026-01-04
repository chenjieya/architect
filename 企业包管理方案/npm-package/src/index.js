import { sum } from "./sum.js";
import { sub } from "./sub.js";

const version = "1.0.0";
console.log(`Library v${version} loaded`);

console.log(sum);
console.log(sub);

export { sum, sub };
