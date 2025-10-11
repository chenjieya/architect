import config from "../config";
import { getLastEvent } from "../utils/eventCpature";
import { getPaths } from "../utils/paths";

/**
 * 这个正则表达式用于匹配 JavaScript 错误栈中的堆栈跟踪信息中的单个条目，其中包含文件名、行号和列号等信息。
 * 具体来说，它匹配以下格式的文本：
 * at functionName (filename:lineNumber:columnNumber)
 * at filename:lineNumber:columnNumber
 * at http://example.com/filename:lineNumber:columnNumber
 * at https://example.com/filename:lineNumber:columnNumber
 */
const FULL_MATCH =
  /^\s*at (?:(.*?) ?\()?((?:file|https?|blob|chrome-extension|address|native|eval|webpack|<anonymous>|[-a-z]+:|.*bundle|\/).*?)(?::(\d+))?(?::(\d+))?\)?\s*$/i;

// 堆栈信息最多10条
const STACK_LIMIT = 10;

// 解析一行堆栈信息
function paseStackLine(line) {
  const lineGroups = line.match(FULL_MATCH);

  // 边界情况，没有匹配上则返回空对象
  if (!lineGroups) return {};

  const functionName = lineGroups[1] || "<anonymous>"; // 函数名可能为空
  const fileName = lineGroups[2] || "";
  const rowNo = lineGroups[3] || undefined;
  const colNo = lineGroups[4] || undefined;

  return {
    functionName,
    fileName,
    colNo,
    rowNo
  };
}

// 解析堆栈信息
function parseErrorStack(error) {
  const { stack } = error;
  if (!stack) return [];

  // 存储解析后的堆栈信息
  const frames = [];

  for (const frame of stack.split("\n").slice(1)) {
    const lineStack = paseStackLine(frame);
    if (lineStack.fileName) {
      frames.push(lineStack);
    }
  }

  return frames.slice(0, STACK_LIMIT);
}

export default function () {
  // 错误监听

  // 资源错误没有冒泡，所以只能在采集阶段捕获错误
  window.addEventListener(
    "error",
    function (e) {
      console.log(e);

      const target = e.target;

      const lastEvent = getLastEvent();

      const paths = getPaths(lastEvent);

      // 资源错误
      if (target && (target.src || target.href)) {
        console.log("资源错误");
        const data = {
          errorType: "resourceError",
          filename: target.src || target.href,
          tagName: target.tagName,
          message: `加载${target.tagName}失败`
        };
        console.log(data);
      } else {
        // js错误
        console.log("js错误");
        const errs = parseErrorStack(e.error);

        const { functionName, fileName, rowNo, colNo } = errs[0] || {};

        const data = {
          type: "jsError",
          functionName,
          fileName,
          rowNo,
          colNo,
          message: e.message,
          stack: e.error.stack,
          paths
        };
        console.log(data);
      }
    },
    true
  );

  // 监听primise错误
  window.addEventListener("unhandledrejection", function (e) {
    console.log(e);
    console.log("promise错误");

    const lastEvent = getLastEvent();

    const paths = getPaths(lastEvent);

    const errs = parseErrorStack(e.reason);
    const { functionName, fileName, rowNo, colNo } = errs[0] || {};
    const data = {
      type: "promiseError",
      functionName,
      fileName,
      rowNo,
      colNo,
      message: e.reason.message,
      stack: e.reason.stack,
      paths
    };
    console.log(data);
  });

  // 监听vue错误
  if (config.vue?.Vue) {
    config.vue.Vue.config.errorHandler = function (err) {
      console.log("vue错误");

      const lastEvent = getLastEvent();

      const paths = getPaths(lastEvent);
      const errs = parseErrorStack(err);
      const { functionName, fileName, rowNo, colNo } = errs[0] || {};
      const data = {
        type: "vueError",
        functionName,
        fileName,
        rowNo,
        colNo,
        message: err.message,
        stack: err.stack,
        paths
      };
      console.log(data);
      //上报vue错误 todo...
    };
  }
}
