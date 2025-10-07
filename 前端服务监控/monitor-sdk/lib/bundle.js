var bundle = function () {
  'use strict';

  var config = {
    appId: "alvis.org.cn",
    userId: "alvis",
    // 上报地址
    reportUrl: "https://report.alvis.org.cn/report",
    // 是否全埋点
    isTrackAll: false,
    vue: {
      Vue: null,
      router: null
    },
    ua: navigator.userAgent
  };
  function setConfig(options) {
    for (var key in options) {
      if (options[key]) {
        config[key] = options[key];
      }
    }
  }
  function watchError() {
    var _config$vue;
    // 错误监听

    // 资源错误没有冒泡，所以只能在采集阶段捕获错误
    window.addEventListener("error", function (e) {
      console.log(e);
      var target = e.target;

      // 资源错误
      if (target && (target.src || target.href)) {
        console.log("资源错误");
      } else {
        // js错误
        console.log("js错误");
      }
    }, true);

    // 监听primise错误
    window.addEventListener("unhandledrejection", function (e) {
      console.log(e);
      console.log("promise错误");
    });

    // 监听vue错误
    if ((_config$vue = config.vue) !== null && _config$vue !== void 0 && _config$vue.Vue) {
      console.log("vue错误");
      config.vue.Vue.config.errorHandler = function (err, vm, info) {
        console.log(err, vm, info);
        //上报vue错误 todo...
      };
    }
  }
  var monitor = {
    start: function start() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      console.log("==== start ====");
      // 1. 合并配置文件
      setConfig(options);

      // 2. 启动错误监控
      watchError();
    }
  };
  return monitor;
}();
