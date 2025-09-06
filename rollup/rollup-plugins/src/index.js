import randomNumber from "./randomNumber";
import deepClone from "./deepClone";
import virtual from "virtual-module";

console.log(virtual)

// 读取json插件
import pkg from '../package.json'
console.log(pkg.name)
console.log(pkg.version)

// import("./sum.js").then((chunk) => {
//   console.log(chunk.default(1, 2));
// });

export default { randomNumber, deepClone };
