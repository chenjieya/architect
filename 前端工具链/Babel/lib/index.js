import "core-js/modules/es.array.to-reversed.js";
import "core-js/modules/es.object.to-string.js";
import "core-js/modules/es.promise.js";
import "core-js/modules/es.promise.with-resolvers.js";
var greet = function greet(name) {
  return "Hello, ".concat(name, "!");
};
console.log(greet("World"));

// 专门处理异步可迭代对象 corejs 3.47才支持
// async function* asyncGen() {
//   yield 1;
//   yield 2;
//   yield 3;
// }

// const result = await Array.fromAsync(asyncGen());
// console.log(result); // [1, 2, 3]

// test.js
// 测试 3.47 新增的特性
var arr = [1, 2, 3];

// 使用 3.44+ 新增的方法
console.log(arr.toReversed());

// 使用 3.47 新增的方法
var _Promise$withResolver = Promise.withResolvers(),
  promise = _Promise$withResolver.promise,
  resolve = _Promise$withResolver.resolve,
  reject = _Promise$withResolver.reject;
