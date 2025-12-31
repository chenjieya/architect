const greet = (name) => `Hello, ${name}!`;
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
const arr = [1, 2, 3];

// 使用 3.44+ 新增的方法
console.log(arr.toReversed());

// 使用 3.47 新增的方法
const { promise, resolve, reject } = Promise.withResolvers();
