---
author: human
ai_editable: false
updated_by: human
updated: 2026-08-02
---
> Service Worker 是 Chrome 插件的“后台大脑”，负责处理后台任务、监听事件和协调通信，在 MV3 中替代了旧的 background page

在 Chrome 浏览器插件（扩展）开发中，**Service Worker** 是扩展的后台脚本，通常在扩展的 `manifest.json` 中以 `"background"` 字段指定，用于在没有页面打开的情况下持续运行一些逻辑。

自 Manifest V3（MV3）起，Chrome 扩展的后台脚本由原来的 **background page** ，变成了 **Service Worker** 模式。

## 1. Service Worker 在扩展中的作用

### 1.1 1.事件响应中心

Service Worker 会响应各种事件，例如：

- `chrome.runtime.onInstalled`：扩展安装时触发
- `chrome.runtime.onMessage`：收到消息时触发
- `chrome.alarms.onAlarm`：定时器事件
- `chrome.webRequest.onBeforeRequest`：监听网络请求
- `chrome.action.onClicked`：点击扩展图标时触发

它就像一个“控制中心”，负责处理这些系统或用户行为。

### 1.2 **无需页面保持打开，始终运行在后台**

- 与页面无关，哪怕所有标签页都关闭了，只要浏览器还开着，Service Worker 也可以被唤醒来执行任务（在 MV3 中它是 **懒加载** 的，即事件来时才唤醒，执行完就释放）。

### 1.3 **协调扩展中的各个组件**

- 负责不同扩展组件（popup 页面、content script、options 页）之间的通信协调。
- 典型方式是用 `chrome.runtime.sendMessage` 和 `chrome.runtime.onMessage` 来通信。

### 1.4 **增强安全性**

Service Worker使得后台脚本是无 DOM 的独立线程，更安全、性能更好，不容易被注入脚本攻击。
