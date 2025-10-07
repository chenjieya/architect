import config from "../config";

export default function () {
  // 错误监听

  // 资源错误没有冒泡，所以只能在采集阶段捕获错误
  window.addEventListener(
    "error",
    function (e) {
      console.log(e);

      const target = e.target;

      // 资源错误
      if (target && (target.src || target.href)) {
        console.log("资源错误");
      } else {
        // js错误
        console.log("js错误");
      }
    },
    true
  );

  // 监听primise错误
  window.addEventListener("unhandledrejection", function (e) {
    console.log(e);
    console.log("promise错误");
  });

  // 监听vue错误
  if (config.vue?.Vue) {
    console.log("vue错误");
    config.vue.Vue.config.errorHandler = function (err, vm, info) {
      console.log(err, vm, info);
      //上报vue错误 todo...
    };
  }
}
