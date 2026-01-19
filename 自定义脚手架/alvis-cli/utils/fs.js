import chalk from "chalk";
import fs from "fs-extra";
import ora from "ora";
import path from "path";

const pwd = process.cwd();

const resolveApp = (relativePath) => path.resolve(pwd, relativePath);

export function removeDir(dir) {
  const spinner = ora("正在删除文件夹....").start();

  try {
    fs.rmSync(resolveApp(dir), {
      recursive: true
    });

    spinner.succeed(chalk.greenBright(`删除文件夹${chalk.cyan(dir)}成功`));
  } catch (err) {
    spinner.fail(chalk.redBright(`删除文件夹${chalk.cyan(dir)}失败`));
    console.log(err);
  }
}

export async function changePackageJson(name, info) {
  try {
    const pkg = await fs.readJson(resolveApp(`${name}/package.json`));

    Object.keys(info).forEach((item) => {
      if (item === "name") {
        pkg[item] = info[item] && info[item].trim() ? info[item].trim() : name;
      } else if (item === "keywords" && info[item] && info[item].trim()) {
        pkg[item] = info[item].split(",");
      } else if (info[item] && info[item].trim()) {
        pkg[item] = info[item];
      }
    });

    await fs.writeJson(resolveApp(`${name}/package.json`), pkg, { spaces: 2 });
  } catch (err) {
    console.log(
      logSymbols.error,
      chalk.red("对不起,修改自定义package.json失败,请手动修改")
    );
    console.log(err);
  }
}
