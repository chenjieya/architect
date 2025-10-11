function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
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
var lastEventCapture = null;
["click", "dblclick", "mousedown", "mouseup", "keydown", "keyup", "touchstart", "touchend", "touchmove"].forEach(function (eventType) {
  document.addEventListener(eventType, function (event) {
    lastEventCapture = event;
  }, {
    capture: true,
    // 捕获阶段
    passive: true // 不阻止默认事件
  });
});
function getLastEvent() {
  return lastEventCapture;
}
function getComposedPathEle(e) {
  if (!e) return [];
  var pathArr = e.path || e.composedPath && e.composedPath();
  if ((pathArr || []).length) {
    return pathArr;
  }

  // 兼容
  var target = e.target;
  var composedPath = [];
  while (target && target.parentNode) {
    composedPath.push(target);
    target = target.parentNode;
  }
  composedPath.push(document, window);
  return composedPath;
}
function getComposedPath(e) {
  if (!e) return [];
  var composedPathEle = getComposedPathEle(e);
  var composePath = composedPathEle.reverse().slice(2).map(function (ele) {
    var selector = ele.tagName.toLowerCase();
    if (ele.id) {
      selector += "#".concat(ele.id);
    }
    if (ele.className) {
      if (typeof ele.className === "string") {
        selector += ".".concat(ele.className.split(" ").join("."));
      } else if (_typeof(ele.className) === "object" && ele.className.baseVal) {
        // svg className 是个对象
        selector += ".".concat(ele.className.baseVal.split(" ").join("."));
      }
    }
    return selector;
  });
  return composePath;
}
function getPaths(e) {
  if (!e) return "";
  var composedPath = getComposedPath(e);
  return composedPath.join(" > ");
}

/**
 * 这个正则表达式用于匹配 JavaScript 错误栈中的堆栈跟踪信息中的单个条目，其中包含文件名、行号和列号等信息。
 * 具体来说，它匹配以下格式的文本：
 * at functionName (filename:lineNumber:columnNumber)
 * at filename:lineNumber:columnNumber
 * at http://example.com/filename:lineNumber:columnNumber
 * at https://example.com/filename:lineNumber:columnNumber
 */
var FULL_MATCH = /^\s*at (?:(.*?) ?\()?((?:file|https?|blob|chrome-extension|address|native|eval|webpack|<anonymous>|[-a-z]+:|.*bundle|\/).*?)(?::(\d+))?(?::(\d+))?\)?\s*$/i;

// 堆栈信息最多10条
var STACK_LIMIT = 10;

// 解析一行堆栈信息
function paseStackLine(line) {
  var lineGroups = line.match(FULL_MATCH);

  // 边界情况，没有匹配上则返回空对象
  if (!lineGroups) return {};
  var functionName = lineGroups[1] || "<anonymous>"; // 函数名可能为空
  var fileName = lineGroups[2] || "";
  var rowNo = lineGroups[3] || undefined;
  var colNo = lineGroups[4] || undefined;
  return {
    functionName: functionName,
    fileName: fileName,
    colNo: colNo,
    rowNo: rowNo
  };
}

// 解析堆栈信息
function parseErrorStack(error) {
  var stack = error.stack;
  if (!stack) return [];

  // 存储解析后的堆栈信息
  var frames = [];
  var _iterator = _createForOfIteratorHelper(stack.split("\n").slice(1)),
    _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var frame = _step.value;
      var lineStack = paseStackLine(frame);
      if (lineStack.fileName) {
        frames.push(lineStack);
      }
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  return frames.slice(0, STACK_LIMIT);
}
function watchError() {
  var _config$vue;
  // 错误监听

  // 资源错误没有冒泡，所以只能在采集阶段捕获错误
  window.addEventListener("error", function (e) {
    console.log(e);
    var target = e.target;
    var lastEvent = getLastEvent();
    var paths = getPaths(lastEvent);

    // 资源错误
    if (target && (target.src || target.href)) {
      console.log("资源错误");
      var data = {
        errorType: "resourceError",
        filename: target.src || target.href,
        tagName: target.tagName,
        message: "\u52A0\u8F7D".concat(target.tagName, "\u5931\u8D25")
      };
      console.log(data);
    } else {
      // js错误
      console.log("js错误");
      var errs = parseErrorStack(e.error);
      var _ref = errs[0] || {},
        functionName = _ref.functionName,
        fileName = _ref.fileName,
        rowNo = _ref.rowNo,
        colNo = _ref.colNo;
      var _data = {
        type: "jsError",
        functionName: functionName,
        fileName: fileName,
        rowNo: rowNo,
        colNo: colNo,
        message: e.message,
        stack: e.error.stack,
        paths: paths
      };
      console.log(_data);
    }
  }, true);

  // 监听primise错误
  window.addEventListener("unhandledrejection", function (e) {
    console.log(e);
    console.log("promise错误");
    var lastEvent = getLastEvent();
    var paths = getPaths(lastEvent);
    var errs = parseErrorStack(e.reason);
    var _ref2 = errs[0] || {},
      functionName = _ref2.functionName,
      fileName = _ref2.fileName,
      rowNo = _ref2.rowNo,
      colNo = _ref2.colNo;
    var data = {
      type: "promiseError",
      functionName: functionName,
      fileName: fileName,
      rowNo: rowNo,
      colNo: colNo,
      message: e.reason.message,
      stack: e.reason.stack,
      paths: paths
    };
    console.log(data);
  });

  // 监听vue错误
  if ((_config$vue = config.vue) !== null && _config$vue !== void 0 && _config$vue.Vue) {
    config.vue.Vue.config.errorHandler = function (err) {
      console.log("vue错误");
      var lastEvent = getLastEvent();
      var paths = getPaths(lastEvent);
      var errs = parseErrorStack(err);
      var _ref3 = errs[0] || {},
        functionName = _ref3.functionName,
        fileName = _ref3.fileName,
        rowNo = _ref3.rowNo,
        colNo = _ref3.colNo;
      var data = {
        type: "vueError",
        functionName: functionName,
        fileName: fileName,
        rowNo: rowNo,
        colNo: colNo,
        message: err.message,
        stack: err.stack,
        paths: paths
      };
      console.log(data);
      //上报vue错误 todo...
    };
  }
}
var monitor = {
  start: function start() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    // 1. 合并配置文件
    setConfig(options);

    // 2. 启动错误监控
    watchError();
  }
};
export { monitor as default };
