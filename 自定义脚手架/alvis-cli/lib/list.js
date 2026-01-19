import { templateArr } from "../utils/constant.js";
import chalk from "chalk";
import { table } from "table";
import logSymbols from "../utils/logSymbols.js";
/**
 * list 命令
 * 表格的格式对list模版进行输出
 */
export function listTable() {
  const data = templateArr.map((item) => [
    chalk.greenBright(item.name),
    chalk.blueBright(item.value),
    chalk.yellowBright(item.desc)
  ]);

  data.unshift([
    chalk.greenBright("模版名称"),
    chalk.blueBright("模版仓库"),
    chalk.yellowBright("模版描述")
  ]);

  const config = {
    header: {
      alignment: "center",
      content: chalk.yellowBright(logSymbols.star, "所有可用的模板")
    }
  };

  console.log(table(data, config));
}
