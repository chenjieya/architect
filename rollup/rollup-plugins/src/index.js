import randomNumber from "./randomNumber";
import deepClone from "./deepClone";
import virtual from "virtual-module";

console.log(virtual)

// 读取json插件
import pkg from '../package.json'
console.log(pkg.name)
console.log(pkg.version)

// import test from './test.json'


import dog from './assets/dog'
import logo from './assets/rollup_logo'

console.log(dog)
console.log(logo)
// import("./sum.js").then((chunk) => {
//   console.log(chunk.default(1, 2));
// });

export default { randomNumber, deepClone };
