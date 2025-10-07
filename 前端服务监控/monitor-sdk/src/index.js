import { setConfig } from "./config/index";
import watchError from "./error/index";

const monitor = {
  start(options = {}) {
    console.log("==== start ====");
    // 1. 合并配置文件
    setConfig(options);

    // 2. 启动错误监控
    watchError();
  }
};

export default monitor;
