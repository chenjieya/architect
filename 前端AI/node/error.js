// 前端服务错误监控hooks,通过捕获异常来监控前端服务错误
// 原生js实现，不要使用react
const useErrorMonitoring = () => {
  window.addEventListener("error", (event) => {
    console.log(event);
    // 1. 区分js错误和资源错误
    if (event.target.src) {
      console.log("资源错误");
    } else {
      console.log("js错误");
    }
  });

  // promise错误
  window.addEventListener("unhandledrejection", (event) => {
    console.log(event);
  });

  // vue错误，会有一个config会有一个Vue实列
  Vue.config.errorHandler = (err, vm, info) => {
    console.log(err, vm, info);
  };
};

export default useErrorMonitoring;
