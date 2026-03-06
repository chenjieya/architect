import { setConfig } from "./config/index";
import watchError from "./error/index";
import { performance } from "./performance";
import { tracker, autoTracker } from "./action/index";
import { pv, pageStayTime, pageChange, onVueRouter } from "./behavior";
import { api } from "./api";

const monitor = {
  start(options = {}) {
    console.log("init");
    // 1. 合并配置文件
    setConfig(options);

    // 2. 启动错误监控
    watchError();

    // 3. 性能检测
    performance();

    // 4. 自动埋点
    autoTracker();

    // 5. 页面行为
    pv();
  },
  // 手动埋点上报
  tracker,
  pageStayTime,
  pageChange,
  onVueRouter
};

export default monitor;
