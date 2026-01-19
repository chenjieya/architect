#!/usr/bin/env node

/**
 * 1. 增加终端标题
 * 2. 下载仓库
 * 3. 美化下载仓库的过程
 * 4. 解析命令行参数
 * 	4.1 alvis create <app-name> -t xxx -f -i
 *  4.2 alvis list
 * 5. 终端输出美化
 */
import { useTitle } from "./lib/title.js";
import { program } from "commander";
import chalk from "chalk";
import { listTable } from "./lib/list.js";
import { createProject } from "./lib/create.js";
import fs from "fs-extra";

const pkg = fs.readJsonSync(new URL("./package.json", import.meta.url));

program.version(pkg.version, "-v, --version", "alvis-cli版本");

program
  .name("alvis")
  .description("一个简单的脚手架工具")
  .usage("<command> [options]")
  .on("--help", () => {
    useTitle("ALVIS");
    console.log(
      `\r\n Run ${chalk.cyan(`alvis <command> --help`)} for detailed usage of given command.`
    );
  });

// 命令 alvis create
program
  .command("create <app-name>")
  .description("创建项目")
  .usage("<app-name> [options]")
  .option("-t, --template [template]", "使用模版创建项目")
  .option("-f, --force", "强制覆盖本地同名项目")
  .option("-i, --ignore", "忽略项目相关描述，快速创建项目")
  .action(createProject);

// 命令 alvis list
program.command("list").description("列举所有可用的模版").action(listTable);

// 解析命令
program.parse(process.argv);
