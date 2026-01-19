import chalk from "chalk";
import logSymbols from "../utils/logSymbols.js";
import shell from "shelljs";
import { messages, templateArr } from "../utils/constant.js";
import {
  inquirerChoose,
  inquirerConfirm,
  inquirerInput
} from "../utils/inquirer.js";
import { clone } from "../utils/gitClone.js";
import fs from "fs-extra";
import { removeDir, changePackageJson } from "../utils/fs.js";

/**
 * Alvis create命令执行
 * @param {*} appName
 * @param {*} options
 */
export async function createProject(appName, options) {
  // 1. 校验
  // 1.1 项目名称是否是合法字符校验
  if (appName.match(/[\u4E00-\u9FFF`~!@#$%&^*[\]()\\;:<.>/?]/g)) {
    console.log(
      logSymbols.error,
      chalk.redBright("对不起,项目名称存在非法字符")
    );
    return;
  }
  // 1.2 用户是否安装了git
  if (!shell.which("git")) {
    console.log(
      logSymbols.error,
      chalk.redBright("对不起,运行脚本必须安装git")
    );
    return;
  }
  // 2. 模版选择（-t xxx）
  let repository = "";
  // 2.1 模版存在，则比对输入的名称是否存在对应的仓库模版
  if (options.template) {
    const templateName = options.template.trim();
    const template = templateArr.find((item) => item.name === templateName);
    if (!template) {
      console.log(
        logSymbols.error,
        `不存在模版${chalk.yellowBright(templateName)}`
      );
      console.log(
        `\r\n 运行${logSymbols.arrow} ${chalk.cyanBright("alvis list")} 查看所有可用模板\r\n`
      );
      return;
    }
    repository = template.value;
  } else {
    // 2.2 模版不存在，则问答式交互，让用户选择一个模版
    const answer = await inquirerChoose(
      chalk.blueBright("请选择一个项目模版:"),
      templateArr
    );
    repository = answer;
  }

  // 3. 是否覆盖已经存在的项目（-f）
  // 3.1 如果不存在-f，则判断是否有同名项目
  if (fs.existsSync(appName) && !options.force) {
    console.log(
      logSymbols.warning,
      `已经存在项目文件夹${chalk.yellowBright(appName)}`
    );
    // 存在同名项目，则询问用户是否进行删除
    const answer = await inquirerConfirm(
      `是否删除文件夹${chalk.yellowBright(appName)}?`
    );
    // 3.1.1 删除
    if (answer) {
      removeDir(appName);
    } else {
      // 3.1.2 不删除则拉取项目失败
      console.log(
        logSymbols.error,
        chalk.redBright(
          `对不起,项目创建失败,存在同名文件夹,${chalk.yellowBright(appName)}`
        )
      );
    }
  } else if (fs.existsSync(appName) && options.force) {
    // 3.2 如果存在-f
    console.log(
      logSymbols.warning,
      `已经存在项目文件夹${chalk.yellowBright(appName)},强制删除`
    );
    // 3.2.1 强制删除文件夹以及下面的子文件
    removeDir(appName);
  }
  // 4. 拉取项目
  try {
    await clone(repository, appName);
  } catch (err) {
    console.log(logSymbols.error, chalk.redBright("对不起,项目拉取失败"));
  }
  // 5. -i是否存在
  // 5.1 存在没有任何问题（不用进行任何操作）
  // 5.2 不存在
  if (!options.ignore) {
    // 5.2.1 交互式，让用户手动输入需要更改的内容，对package.json文件进行修改
    const answer = {};
    for (const item of messages) {
      const res = await inquirerInput(item.message, item.validate);
      answer[item.name] = res;
    }

    // 写入json文件
    await changePackageJson(appName, answer);
  }
}
