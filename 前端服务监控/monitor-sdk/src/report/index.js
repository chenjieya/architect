import { config } from "../config";
import getUid from "../utils/getUid";
import { getCache, clearCache, addCache } from "../utils/cache";

const uid = getUid();

function reportWithXHR(url, data) {
  const xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send(data);
}

function sendBeacon(url, data) {
  if (navigator.sendBeacon) {
    navigator.sendBeacon(url, data);
  } else {
    reportWithXHR(url, data);
  }
}

/**
 * 由于我们有很多内容需要上报，
 * 所以我这里为了简单区分和上报
 * 用type来区分上报的内容是什么
 * @param {string} type 上报类型 “error” | "action" | "behavior" | "api" | "performance"
 * @param {Object} data 上报信息
 * @param {boolean} isImmediate 是否立即上报，默认为false
 */
export function report(type, data, isImmediate) {
  if (!config.reportUrl) {
    console.error("请配置上报地址");
    return;
  }

  const reportData = JSON.stringify({
    id: uid,
    appId: config.appId, //应用id
    userId: config.userId, //用户id
    currentTime: Date.now(), //当前事件
    type, //上报类型
    data, //上报信息
    currentPage: window.location.href, //当前页面
    ua: config.ua //用户浏览器和系统
  });

  // 1. 立即上报
  if (isImmediate) {
    sendBeacon(config.reportUrl, reportData);
    return;
  }

  // 2. 浏览器空闲时间上报
  if (window.requestIdleCallback) {
    window.requestIdleCallback(
      () => {
        sendBeacon(config.reportUrl, reportData);
      },
      { timeout: 3000 }
    );
  } else {
    setTimeout(() => {
      sendBeacon(config.reportUrl, reportData);
    });
  }
}

// 并不是每个内容都需要除法上报的，需要弄个缓存集合
let timer = null;
export function layzeReport(type, data, timeout = 3000) {
  // 1. 添加到缓存中
  addCache(type, data);

  // 2. 防抖， 如果一直添加则不上报，添加结束 timeout之后在进行上报
  clearTimeout(timer);
  timer = setTimeout(() => {
    const cache = getCache();

    if (cache.size) {
      for (const [type, data] of cache) {
        report(type, data, timeout);
      }
      // 清空所有缓存
      clearCache();
    }
  }, timeout);
}
