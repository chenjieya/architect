const bable = require("@babel/core");
const myPlugin1 = require("../plugins/babel-plugin-pow.cjs");
const myPlugin2 = require("../plugins/babel-plugin-fun.cjs");

// 源码内容
const code =
  'const greet = (name) => `Hello, ${name}!`;console.log(greet("World"));';

// bable.transform(
//   code,
//   {
//     presets: ["@babel/preset-env"]
//   },
//   function (err, result) {
//     if (err) throw err;
//     console.log(result.code);
//   }
// );

// bable.parse(code, function (err, ast) {
//   if (err) throw err;
//   console.log(ast);
// });

// 自定义插件
// const code1 = "const test = 2 ** 2";
// bable.transform(
//   code1,
//   {
//     plugins: [myPlugin1]
//   },
//   function (err, result) {
//     if (err) throw err;
//     console.log(result.code);
//   }
// );

bable.transform(
  code,
  {
    plugins: [myPlugin2]
  },
  function (err, result) {
    if (err) throw err;
    console.log(result.code);
  }
);
