import randomNumber from "./randomNumber";
import deepClone from "./deepClone";
import virtual from "virtual-module";

console.log(virtual)

// import("./sum.js").then((chunk) => {
//   console.log(chunk.default(1, 2));
// });

export default { randomNumber, deepClone };
