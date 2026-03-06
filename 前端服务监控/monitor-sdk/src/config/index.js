export const config = {
  appId: "alvis.org.cn",
  userId: "alvis",
  // 上报地址
  reportUrl: "http://127.0.0.1:3001/report/actions",
  // 是否全埋点
  isTrackAll: false,
  vue: {
    Vue: null,
    router: null
  },
  ua: navigator.userAgent
};

export default config;

export function setConfig(options) {
  for (const key in options) {
    if (options[key]) {
      config[key] = options[key];
    }
  }
}
