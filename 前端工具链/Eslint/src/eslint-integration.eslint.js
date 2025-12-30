// const { ESLint } = require("eslint");
// const globals = require("globals");
// const js = require("@eslint/js");
// const chalk = require("chalk");

// // 创建Eslint实例
// function createEslint(overrideConfig) {
//   return new ESLint({
//     overrideConfig,
//     fix: true
//   });
// }

// // 对结果进行友好输出
// function outputLintingResults(result) {
//   const failNum = result.reduce((pre, item) => {
//     return pre + item.errorCount + item.warningCount;
//   }, 0);

//   if (failNum > 0) {
//     console.log("格式化错误 \n");

//     const messages = result[0].messages;
//     for (let i = 0; i < messages.length; i++) {
//       console.error(chalk.red.bold("FAIL:") + " " + messages[i].message);
//     }

//     console.log("\n" + chalk.dim(result[0].filePath));
//   } else {
//     console.log("没有格式错误");
//   }
// }

// // 对传入的文件进行 lint检车 和 fix修复
// async function lintAndFix(eslint, filepaths) {
//   try {
//     const lintRes = await eslint.lintFiles(filepaths);

//     // 会将修复结果写入到原来的文件系统中
//     await ESLint.outputFixes(lintRes);

//     // 对结果进行控制台打印
//     outputLintingResults(lintRes);
//   } catch (err) {
//     console.log(err);
//   }
// }

// function lintFiles(filepaths) {
//   const overrideConfig = [
//     js.configs.recommended,
//     {
//       languageOptions: {
//         globals: {
//           ...globals.browser
//         },
//         ecmaVersion: "latest",
//         sourceType: "module"
//       },
//       rules: {
//         indent: ["error", 2],
//         quotes: ["error", "single"],
//         semi: ["error", "always"],
//         "no-console": "error"
//       }
//     }
//   ];
//   const eslint = createEslint(overrideConfig);
//   lintAndFix(eslint, filepaths);
// }

// module.exports = {
//   lintFiles
// };
