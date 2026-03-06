function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n3 = 0, F = function F() {}; return { s: F, n: function n() { return _n3 >= r.length ? { done: !0 } : { done: !1, value: r[_n3++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
(function (global, factory) {
  (typeof exports === "undefined" ? "undefined" : _typeof(exports)) === 'object' && typeof module !== 'undefined' ? module.exports = factory() : typeof define === 'function' && define.amd ? define(factory) : (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.bundle = factory());
})(this, function () {
  'use strict';

  var config = {
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
  function getPaths$1(e) {
    if (!e) return "";
    var composedPath = getComposedPath(e);
    return composedPath.join(" > ");
  }
  function getUniqueID() {
    return "alvis-".concat(Date.now(), "-").concat(Math.floor(Math.random() * (9e12 - 1)) + 1e12);
  }
  var cache = new Map();
  function addCache(key, item) {
    cache.get(key) ? cache.get(key).push(item) : cache.set(key, [item]);
  }
  function getCache() {
    return cache;
  }
  function clearCache() {
    cache.clear();
  }
  var uid = getUniqueID();
  function reportWithXHR(url, data) {
    var xhr = new XMLHttpRequest();
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
  function report(type, data, isImmediate) {
    if (!config.reportUrl) {
      console.error("请配置上报地址");
      return;
    }
    var reportData = JSON.stringify({
      id: uid,
      appId: config.appId,
      //应用id
      userId: config.userId,
      //用户id
      currentTime: Date.now(),
      //当前事件
      type: type,
      //上报类型
      data: data,
      //上报信息
      currentPage: window.location.href,
      //当前页面
      ua: config.ua //用户浏览器和系统
    });

    // 1. 立即上报
    if (isImmediate) {
      sendBeacon(config.reportUrl, reportData);
      return;
    }

    // 2. 浏览器空闲时间上报
    if (window.requestIdleCallback) {
      window.requestIdleCallback(function () {
        sendBeacon(config.reportUrl, reportData);
      }, {
        timeout: 3000
      });
    } else {
      setTimeout(function () {
        sendBeacon(config.reportUrl, reportData);
      });
    }
  }

  // 并不是每个内容都需要除法上报的，需要弄个缓存集合
  var timer = null;
  function layzeReport(type, data) {
    var timeout = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 3000;
    // 1. 添加到缓存中
    addCache(type, data);

    // 2. 防抖， 如果一直添加则不上报，添加结束 timeout之后在进行上报
    clearTimeout(timer);
    timer = setTimeout(function () {
      var cache = getCache();
      if (cache.size) {
        var _iterator = _createForOfIteratorHelper(cache),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var _step$value = _slicedToArray(_step.value, 2),
              _type = _step$value[0],
              _data = _step$value[1];
            report(_type, _data, timeout);
          }
          // 清空所有缓存
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
        clearCache();
      }
    }, timeout);
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
    var _iterator2 = _createForOfIteratorHelper(stack.split("\n").slice(1)),
      _step2;
    try {
      for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
        var frame = _step2.value;
        var lineStack = paseStackLine(frame);
        if (lineStack.fileName) {
          frames.push(lineStack);
        }
      }
    } catch (err) {
      _iterator2.e(err);
    } finally {
      _iterator2.f();
    }
    return frames.slice(0, STACK_LIMIT);
  }
  function watchError() {
    var _config$vue;
    // 错误监听

    // 资源错误没有冒泡，所以只能在采集阶段捕获错误
    window.addEventListener("error", function (e) {
      var target = e.target;
      var lastEvent = getLastEvent();
      var paths = getPaths$1(lastEvent);

      // 资源错误
      if (target && (target.src || target.href)) {
        var data = {
          errorType: "resourceError",
          filename: target.src || target.href,
          tagName: target.tagName,
          message: "\u52A0\u8F7D".concat(target.tagName, "\u5931\u8D25")
        };
        layzeReport("error", data);
      } else {
        // js错误
        var errs = parseErrorStack(e.error);
        var _ref = errs[0] || {},
          functionName = _ref.functionName,
          fileName = _ref.fileName,
          rowNo = _ref.rowNo,
          colNo = _ref.colNo;
        var _data2 = {
          type: "jsError",
          functionName: functionName,
          fileName: fileName,
          rowNo: rowNo,
          colNo: colNo,
          message: e.message,
          stack: e.error.stack,
          paths: paths
        };
        layzeReport("error", _data2);
      }
    }, true);

    // 监听primise错误
    window.addEventListener("unhandledrejection", function (e) {
      var lastEvent = getLastEvent();
      var paths = getPaths$1(lastEvent);
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
      layzeReport("error", data);
    });

    // 监听vue错误
    if ((_config$vue = config.vue) !== null && _config$vue !== void 0 && _config$vue.Vue) {
      config.vue.Vue.config.errorHandler = function (err) {
        var lastEvent = getLastEvent();
        var paths = getPaths$1(lastEvent);
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
        layzeReport("error", data);
      };
    }
  }
  var e = -1;
  var t = function t(_t) {
      addEventListener("pageshow", function (n) {
        n.persisted && (e = n.timeStamp, _t(n));
      }, true);
    },
    n = function n(e, t, _n, i) {
      var s, o;
      return function (r) {
        t.value >= 0 && (r || i) && (o = t.value - (s !== null && s !== void 0 ? s : 0), (o || void 0 === s) && (s = t.value, t.delta = o, t.rating = function (e, t) {
          return e > t[1] ? "poor" : e > t[0] ? "needs-improvement" : "good";
        }(t.value, _n), e(t)));
      };
    },
    i = function i(e) {
      requestAnimationFrame(function () {
        return requestAnimationFrame(function () {
          return e();
        });
      });
    },
    s = function s() {
      var e = performance.getEntriesByType("navigation")[0];
      if (e && e.responseStart > 0 && e.responseStart < performance.now()) return e;
    },
    o = function o() {
      var _e$activationStart;
      var e = s();
      return (_e$activationStart = e === null || e === void 0 ? void 0 : e.activationStart) !== null && _e$activationStart !== void 0 ? _e$activationStart : 0;
    },
    r = function r(t) {
      var n = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : -1;
      var i = s();
      var r = "navigate";
      e >= 0 ? r = "back-forward-cache" : i && (document.prerendering || o() > 0 ? r = "prerender" : document.wasDiscarded ? r = "restore" : i.type && (r = i.type.replace(/_/g, "-")));
      return {
        name: t,
        value: n,
        rating: "good",
        delta: 0,
        entries: [],
        id: "v5-".concat(Date.now(), "-").concat(Math.floor(8999999999999 * Math.random()) + 1e12),
        navigationType: r
      };
    },
    c = new WeakMap();
  function a(e, t) {
    return c.get(e) || c.set(e, new t()), c.get(e);
  }
  var d = /*#__PURE__*/function () {
    function d() {
      _classCallCheck(this, d);
      _defineProperty(this, "t", void 0);
      _defineProperty(this, "i", 0);
      _defineProperty(this, "o", []);
    }
    return _createClass(d, [{
      key: "h",
      value: function h(e) {
        var _this$t;
        if (e.hadRecentInput) return;
        var t = this.o[0],
          n = this.o.at(-1);
        this.i && t && n && e.startTime - n.startTime < 1e3 && e.startTime - t.startTime < 5e3 ? (this.i += e.value, this.o.push(e)) : (this.i = e.value, this.o = [e]), (_this$t = this.t) === null || _this$t === void 0 ? void 0 : _this$t.call(this, e);
      }
    }]);
  }();
  var h = function h(e, t) {
      var n = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      try {
        if (PerformanceObserver.supportedEntryTypes.includes(e)) {
          var _i = new PerformanceObserver(function (e) {
            Promise.resolve().then(function () {
              t(e.getEntries());
            });
          });
          return _i.observe(_objectSpread({
            type: e,
            buffered: !0
          }, n)), _i;
        }
      } catch (_unused) {}
    },
    f = function f(e) {
      var t = false;
      return function () {
        t || (e(), t = true);
      };
    };
  var u = -1;
  var l = new Set(),
    m = function m() {
      return "hidden" !== document.visibilityState || document.prerendering ? 1 / 0 : 0;
    },
    _p = function p(e) {
      if ("hidden" === document.visibilityState) {
        if ("visibilitychange" === e.type) {
          var _iterator3 = _createForOfIteratorHelper(l),
            _step3;
          try {
            for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
              var _e = _step3.value;
              _e();
            }
          } catch (err) {
            _iterator3.e(err);
          } finally {
            _iterator3.f();
          }
        }
        isFinite(u) || (u = "visibilitychange" === e.type ? e.timeStamp : 0, removeEventListener("prerenderingchange", _p, true));
      }
    },
    v = function v() {
      if (u < 0) {
        var _globalThis$performan;
        var _e2 = o(),
          _n2 = document.prerendering ? void 0 : (_globalThis$performan = globalThis.performance.getEntriesByType("visibility-state").filter(function (t) {
            return "hidden" === t.name && t.startTime > _e2;
          })[0]) === null || _globalThis$performan === void 0 ? void 0 : _globalThis$performan.startTime;
        u = _n2 !== null && _n2 !== void 0 ? _n2 : m(), addEventListener("visibilitychange", _p, true), addEventListener("prerenderingchange", _p, true), t(function () {
          setTimeout(function () {
            u = m();
          });
        });
      }
      return {
        get firstHiddenTime() {
          return u;
        },
        onHidden: function onHidden(e) {
          l.add(e);
        }
      };
    },
    g = function g(e) {
      document.prerendering ? addEventListener("prerenderingchange", function () {
        return e();
      }, true) : e();
    },
    y = [1800, 3e3],
    E = function E(e) {
      var s = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      g(function () {
        var c = v();
        var a,
          d = r("FCP");
        var f = h("paint", function (e) {
          var _iterator4 = _createForOfIteratorHelper(e),
            _step4;
          try {
            for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
              var _t2 = _step4.value;
              "first-contentful-paint" === _t2.name && (f.disconnect(), _t2.startTime < c.firstHiddenTime && (d.value = Math.max(_t2.startTime - o(), 0), d.entries.push(_t2), a(true)));
            }
          } catch (err) {
            _iterator4.e(err);
          } finally {
            _iterator4.f();
          }
        });
        f && (a = n(e, d, y, s.reportAllChanges), t(function (t) {
          d = r("FCP"), a = n(e, d, y, s.reportAllChanges), i(function () {
            d.value = performance.now() - t.timeStamp, a(true);
          });
        }));
      });
    },
    b = [.1, .25],
    L = function L(e) {
      var s = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var o = v();
      E(f(function () {
        var c,
          f = r("CLS", 0);
        var u = a(s, d),
          l = function l(e) {
            var _iterator5 = _createForOfIteratorHelper(e),
              _step5;
            try {
              for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
                var _t3 = _step5.value;
                u.h(_t3);
              }
            } catch (err) {
              _iterator5.e(err);
            } finally {
              _iterator5.f();
            }
            u.i > f.value && (f.value = u.i, f.entries = u.o, c());
          },
          m = h("layout-shift", l);
        m && (c = n(e, f, b, s.reportAllChanges), o.onHidden(function () {
          l(m.takeRecords()), c(true);
        }), t(function () {
          u.i = 0, f = r("CLS", 0), c = n(e, f, b, s.reportAllChanges), i(function () {
            return c();
          });
        }), setTimeout(c));
      }));
    };
  var A = function A(e) {
    var t = globalThis.requestIdleCallback || setTimeout;
    "hidden" === document.visibilityState ? e() : (e = f(e), addEventListener("visibilitychange", e, {
      once: true,
      capture: true
    }), t(function () {
      e(), removeEventListener("visibilitychange", e, {
        capture: true
      });
    }));
  };
  var N = /*#__PURE__*/function () {
    function N() {
      _classCallCheck(this, N);
      _defineProperty(this, "m", void 0);
    }
    return _createClass(N, [{
      key: "h",
      value: function h(e) {
        var _this$m;
        (_this$m = this.m) === null || _this$m === void 0 || _this$m.call(this, e);
      }
    }]);
  }();
  var q = [2500, 4e3],
    x = function x(e) {
      var s = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      g(function () {
        var c = v();
        var d,
          u = r("LCP");
        var l = a(s, N),
          m = function m(e) {
            s.reportAllChanges || (e = e.slice(-1));
            var _iterator6 = _createForOfIteratorHelper(e),
              _step6;
            try {
              for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
                var _t4 = _step6.value;
                l.h(_t4), _t4.startTime < c.firstHiddenTime && (u.value = Math.max(_t4.startTime - o(), 0), u.entries = [_t4], d());
              }
            } catch (err) {
              _iterator6.e(err);
            } finally {
              _iterator6.f();
            }
          },
          p = h("largest-contentful-paint", m);
        if (p) {
          d = n(e, u, q, s.reportAllChanges);
          var _o = f(function () {
              m(p.takeRecords()), p.disconnect(), d(true);
            }),
            _c2 = function _c(e) {
              e.isTrusted && (A(_o), removeEventListener(e.type, _c2, {
                capture: true
              }));
            };
          for (var _i2 = 0, _arr = ["keydown", "click", "visibilitychange"]; _i2 < _arr.length; _i2++) {
            var _e3 = _arr[_i2];
            addEventListener(_e3, _c2, {
              capture: true
            });
          }
          t(function (t) {
            u = r("LCP"), d = n(e, u, q, s.reportAllChanges), i(function () {
              u.value = performance.now() - t.timeStamp, d(true);
            });
          });
        }
      });
    },
    H = [800, 1800],
    _O = function O(e) {
      document.prerendering ? g(function () {
        return _O(e);
      }) : "complete" !== document.readyState ? addEventListener("load", function () {
        return _O(e);
      }, true) : setTimeout(e);
    },
    $ = function $(e) {
      var i = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var c = r("TTFB"),
        a = n(e, c, H, i.reportAllChanges);
      _O(function () {
        var d = s();
        d && (c.value = Math.max(d.responseStart - o(), 0), c.entries = [d], a(true), t(function () {
          c = r("TTFB", 0), a = n(e, c, H, i.reportAllChanges), a(true);
        }));
      });
    };
  function sendToAnalytics(metric) {
    console.log(metric);
    var data = {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta
    };
    layzeReport("performance", data);
  }
  function performance$1() {
    /*
    const {
      fetchStart,
      connectStart,
      connectEnd,
      requestStart,
      responseStart,
      responseEnd,
      domLoading,
      domInteractive,
      domContentLoadedEventStart,
      domContentLoadedEventEnd,
      loadEventStart,
      domainLookupStart,
      domainLookupEnd,
      navigationStart
    } = window.performance.timing;
     console.log(fetchStart,
      connectStart,
      connectEnd,
      requestStart,
      responseStart,
      responseEnd,
      domLoading,
      domInteractive,
      domContentLoadedEventStart,
      domContentLoadedEventEnd,
      loadEventStart,
      domainLookupStart,
      domainLookupEnd,
      navigationStart)
    
      const tcp = connectEnd - connectStart; // TCP连接耗时
      const dns = domainLookupEnd - domainLookupStart; // dns 解析时长
      const ttfbTime = responseStart - requestStart; // 首字节到达时间
      const responseTime = responseEnd - responseStart; // response响应耗时
      const parseDOMTime = loadEventStart - domLoading; // DOM解析渲染的时间
      const domContentLoadedTime = domContentLoadedEventEnd - domContentLoadedEventStart; // DOMContentLoaded事件回调耗时
      const timeToInteractive = domInteractive - fetchStart; // 首次可交互时间
      const loadTime = loadEventStart - fetchStart; // 完整的加载时间
      const whiteScreen = domLoading - navigationStart; // 白屏时间
      
    
      console.log(tcp,dns,ttfbTime,responseTime,parseDOMTime,domContentLoadedTime,timeToInteractive,loadTime,whiteScreen)
    */
    /*
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntriesByName("first-contentful-paint")) {
        console.log("FCP====", entry.startTime, entry);
      }
    }).observe({ type: "paint", buffered: true });
     //每一个资源的响应时间
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      for (const entry of entries) {
        if (entry.responseStart > 0) {
          console.log(
            `TTFB === ${entry.responseStart - entry.requestStart}`,
            entry.name
          );
        }
      }
    }).observe({ type: "resource", buffered: true });
    */

    L(sendToAnalytics);
    E(sendToAnalytics);
    x(sendToAnalytics);
    $(sendToAnalytics);
  }
  function tracker(event) {
    // 如果是全埋点，则不用手动上报
    if (config.isTrackAll) return;
    var target = event.target;
    var data = {
      eventType: event.type,
      tagName: target.tagName,
      x: event.x,
      y: event.y,
      paths: getPaths$1(event),
      value: target.value || target.innerText
    };

    // 添加到上报队列
    layzeReport("action", data);
  }

  // 全部埋点上报 和 属性上报
  function autoTracker() {
    ["click", "keydown", "blur", "focus", "touchstart", "touchend"].forEach(function (eventType) {
      var timer = null;
      document.addEventListener(eventType, function (event) {
        clearTimeout(timer);
        timer = setTimeout(function () {
          var target = event.target;
          var dataTracker = target.getAttribute("data-tracker");

          //如果配置项中config.trackerAll为true，则所有元素都需要上报
          //如果元素上有data-tracker属性，则上报
          if (config.isTrackAll || dataTracker) {
            var data = {
              eventType: event.type,
              tagName: target.tagName || "window",
              x: event.x,
              y: event.y,
              paths: getPaths$1(event),
              value: target.value || target.innerText || ""
            };
            layzeReport("action", data);
          }
        }, 500);
      }, false);
    });
  }
  var connection = navigator.connection;
  function pv() {
    layzeReport("behavior", {
      subType: "pv",
      referrer: document.referrer,
      effectiveType: connection ? connection.effectiveType : "",
      //网络环境
      rtt: connection ? connection.rtt : "" //往返时间
    });
  }

  //页面停留时间
  function pageStayTime() {
    var startTime = Date.now();
    //unload和beforeunload会在窗口卸载的时候触发
    //要注意窗口卸载的时候，如果你使用ajax提交会出现问题
    window.addEventListener("beforeunload", function () {
      var stayTime = Date.now() - startTime;
      report("behavior", [{
        subType: "pageStayTime",
        effectiveType: connection ? connection.effectiveType : "",
        //网络环境
        stayTime: stayTime
      }], true);
    }, true);
  }

  //首先记录一开始的时间
  window.pageViewStartTime = Date.now();
  //通过vue的路由来记录页面切换
  function onVueRouter() {
    if (!config.vue || !config.vue.router) return;
    config.vue.router.beforeEach(function (to, from, next) {
      //如果是首次加载页面不需要统计
      if (!from.name) return next();
      var stayTime = Date.now() - window.pageViewStartTime;
      console.log("\u9875\u9762\u505C\u7559\u65F6\u95F4 ".concat(from.name, ": ").concat(stayTime, "ms"));
      console.log(to);
      console.log(from);
      window.pageViewStartTime = Date.now();
      layzeReport("behavior", {
        subType: "vueRouterChange",
        params: to.params,
        query: to.query,
        name: to.name || to.path,
        from: from.fullPath,
        to: to.fullPath,
        stayTime: stayTime
      });
      next();
    });
  }
  function pageChange() {
    var from = document.referrer;
    window.addEventListener("popstate", function () {
      var to = window.location.href;
      console.log(to, from);
      layzeReport("behavior", {
        subType: "pageChange",
        from: from,
        to: to
      });
      from = to;
    }, true);
    var oldURL = document.referrer;
    window.addEventListener("hashchange", function (event) {
      var newURL = event.newURL;
      layzeReport("behavior", {
        subType: "pageChange",
        from: oldURL,
        to: newURL
      });
      oldURL = newURL;
    }, true);
  }
  var monitor = {
    start: function start() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      console.log("init");
      // 1. 合并配置文件
      setConfig(options);

      // 2. 启动错误监控
      watchError();

      // 3. 性能检测
      performance$1();

      // 4. 自动埋点
      autoTracker();

      // 5. 页面行为
      pv();
    },
    // 手动埋点上报
    tracker: tracker,
    pageStayTime: pageStayTime,
    pageChange: pageChange,
    onVueRouter: onVueRouter
  };
  return monitor;
});
