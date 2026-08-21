---
author: ai
ai_editable: true
summary: '解释 DeepSeek Harness 为什么采用 Cordis 插件架构，以及插件、服务、ctx、inject、事件和可逆副作用分别解决什么问题。'
refs:
  pages:
    - DeepSeek Harness 总览
    - Profile 与组合包
    - 能力服务与子系统地图
    - 插件开发入门
  raw:
    - path: raw/DeepSeek Harness/03-参考/01-概念/00-架构.md
      sha256: 780397de376e4c53170ea7deb56915cf90e5d6605b5f685e6c21e49a3ec9937a
    - path: raw/DeepSeek Harness/03-参考/01-概念/01-Cordis 入门.md
      sha256: bfebf7e83867cb6eac7b48f060bb0fc2db28f8e1aa45f3ff018f3cde1c521ad3
    - path: raw/DeepSeek Harness/02-开发/02-框架能力/01-插件与生命周期.md
      sha256: 0536682ca55abe9ab6f3d3defa2f05ca4fa99fd70f1497d283bb95ce9979ddb5
    - path: raw/DeepSeek Harness/02-开发/02-框架能力/02-服务与依赖.md
      sha256: 963101590c1e722e1fb63c84b0a3004a5465a1f88a1ad4c211db9c4e1a684b5a
    - path: raw/DeepSeek Harness/02-开发/02-框架能力/03-事件系统.md
      sha256: 113900d19e23803ef978e9d0ac5ebc5deba12651849ed6beeefea46ec3c809aa
updated_by: ai
updated: 2026-08-19
---

DeepSeek Harness 的底层框架叫 Cordis。要理解它，先记住一句话：**Cordis 让一个复杂系统像搭积木一样组合起来**。

在 DeepSeek Harness 里，模型适配器、工具注册表、会话日志、Agent 循环、沙箱、Web UI 都是插件。插件不是“额外功能”的意思，而是系统的基本组成单位。

## 1. 为什么要“一切皆插件”

普通项目常见写法是：

```text
主程序
  直接 import 文件系统实现
  直接 import 模型实现
  直接 import 工具实现
  直接 import 持久化实现
```

这种写法早期很快，但项目一大就麻烦：

- 想把本地文件系统换成远程沙箱，要改很多地方。
- 想把 DeepSeek 模型换成另一个提供方，要改调用链。
- 想给工具加审批，要到处插判断。
- 想卸载某个能力，很难知道它注册过什么资源。

Cordis 的思路是反过来：主程序不直接认识具体实现，只认识一个共享上下文 `ctx`。插件把能力注册到 `ctx` 上，其他插件再通过 `ctx` 使用能力。

## 2. ctx 是什么

`ctx` 可以理解成一个共享服务台。

每个服务占一个稳定名字，比如：

| ctx 名称           | 大白话含义                 |
| ------------------ | -------------------------- |
| `ctx.llm`          | 模型适配器注册表           |
| `ctx.tools`        | 工具注册表和工具执行流水线 |
| `ctx.sessions`     | 会话日志和会话存储         |
| `ctx.systemPrompt` | 系统提示词组装器           |
| `ctx.sandbox`      | 进程沙箱能力               |
| `ctx.approval`     | 用户审批能力               |

插件如果想调用模型，不需要 import 某个具体 DeepSeek 实现，而是使用 `ctx.llm`。这样具体提供方可以换，调用方不用变。

## 3. 插件和服务不是一回事

你前面问“是不是万物都是插件”，这个理解基本对，但还要补一层：

- **插件**是“被 Cordis 加载和运行的模块”，它通常导出 `apply(ctx)`。
- **服务**是“挂在 `ctx` 上、给别人调用的能力入口”，比如 `ctx.tools`、`ctx.llm`。
- 一个插件可以只使用服务，也可以注册一些条目到服务里，还可以自己提供一个新服务。

所以不要把“插件”和“服务”完全画等号。更准确地说：系统由很多插件拼起来，但插件之间长期协作时，通常通过 `ctx` 上的服务来协作。

```text
插件 A：提供 tools 服务
  -> ctx.tools 出现

插件 B：依赖 tools 服务
  -> inject = ['tools']
  -> apply(ctx) 里使用 ctx.tools
```

如果某个插件内部写了一个继承自 `Service` 的类，并把它命名为 `metrics`，那这个能力才会变成 `ctx.metrics` 这样的服务入口。不是每个插件都会自动变成 `ctx.xxx`。

## 4. inject 是什么

`inject` 是插件声明依赖的方式。

例如一个工具插件需要把工具注册到 `ctx.tools`，它会声明自己依赖 `tools`。Cordis 会等 `ctx.tools` 准备好，再启动这个插件。

这解决了“启动顺序”问题。开发者不用手工安排“先加载 A，再加载 B，再加载 C”，而是让依赖关系自己说话。

```text
工具插件声明：我需要 tools
Cordis 判断：tools 服务已就绪
Cordis 启动：调用工具插件 apply(ctx)
```

这里容易误解：`inject` 不是“把我注入到 `ctx.tools` 里”，而是“我运行前需要 `ctx.tools` 已经存在”。

换句话说：

- `inject = ['tools']` 依赖的是 `ctx.tools` 这个服务。
- 它不是依赖某个叫 tools 的插件。
- 它也不是依赖注册在 `ctx.tools` 里的某个具体工具。

如果插件 A 和插件 B 都写了 `inject = ['tools']`，只说明它们都需要 tools 服务，不说明 A 依赖 B，也不说明 B 依赖 A。

```text
插件 A：inject = ['tools']，向 ctx.tools 注册工具 A
插件 B：inject = ['tools']，向 ctx.tools 注册工具 B

关系：A 和 B 都依赖 tools 服务
结论：A 和 B 彼此没有依赖关系
```

如果 A 真要直接使用 B 的能力，推荐让 B 暴露一个清晰服务，例如 `ctx.searchIndex`，然后 A 声明：

```ts
export const inject = ['searchIndex']
```

这样 Cordis 才能知道：A 必须等 `searchIndex` 服务准备好之后才能启动。

这也回答了“会不会 A 先注册，B 还没注册”的问题：Cordis 会根据服务依赖管理插件生命周期。依赖没准备好时，插件不会进入正常运行状态；依赖服务消失时，依赖它的插件也会被卸载，服务回来后再重新加载。

## 5. 事件是插件之间的通道

插件之间除了直接调用服务，还会通过事件协作。

可以把事件理解成“流程中的挂点”。比如：

- 模型请求发出前，触发 `agent/request`。
- 工具执行前，触发 `tools/pre-execute`。
- 工具执行后，触发 `tools/post-execute`。
- 会话追加新事件后，触发 `session/event`。

这样一个安全插件可以监听工具执行前的事件，决定是否拦截；一个遥测插件可以监听工具执行后的事件，记录耗时；它们都不需要改工具本身。

Cordis 里常见几种事件分发方式：

| 方式          | 适合场景       | 小白理解      |
| ----------- | ---------- | --------- |
| `emit`      | 只通知，不等结果   | 广播一声“发生了” |
| `waterfall` | 一层层包装和改写   | 像中间件流水线   |
| `parallel`  | 多个监听器并行处理  | 同时通知多个人   |
| `serial`    | 按顺序执行并收集结果 | 排队处理      |

DeepSeek Harness 里很重要的拦截点，如 `agent/pre-step`、`agent/request`、`llm/stream`、`tools/pre-execute`，都属于 waterfall。监听器如果不调用 `next()`，就会短路后面的流程。

事件更适合“我想知道某件事发生了，或者在流程中插一层处理”，服务更适合“我需要直接调用一个明确能力”。所以插件之间不是只能靠事件协作，也不是都应该互相 import；该直接调用能力时用服务，该松耦合观察流程时用事件。

## 6. 可逆副作用是什么

插件经常会注册东西：

- 注册一个工具。
- 注册一个模型适配器。
- 注册一个事件监听器。
- 启动一个定时器。
- 挂载一个 UI 模块。

这些动作都是“副作用”。如果插件被热重载或卸载，这些副作用必须撤销，否则旧工具、旧监听器、旧定时器会残留。

Cordis 的要求是：注册要能撤销。插件通过 `ctx.effect()` 或 `ctx.on()` 安装资源，卸载时框架会执行清理函数。

这就是为什么 DeepSeek Harness 可以支持插件热替换：新插件上来，旧插件留下的注册会被清掉。

## 7. 这套设计的核心收益

插件化架构带来的不是“看起来高级”，而是几个很实际的收益：

| 收益   | 具体表现                                      |
| ------ | --------------------------------------------- |
| 可替换 | 本地文件系统可以换成远程沙箱提供方            |
| 可扩展 | 新工具可以注册进 `ctx.tools`，不改 Agent 循环 |
| 可组合 | 不同 profile 可以装配不同插件树               |
| 可清理 | 插件卸载时撤销自己的注册                      |
| 可测试 | 单个服务可以用测试提供方替换真实提供方        |

所以，DeepSeek Harness 的架构不是“有一个核心，然后到处打补丁”。更准确的理解是：核心也只是插件树里的一部分，能力通过服务和事件连接起来。

## 8. 和其他页面的关系

- [[DeepSeek Harness 总览]] 解释整套系统解决什么问题。
- [[Profile 与组合包]] 解释插件树启动时怎么拼出来。
- [[能力服务与子系统地图]] 解释 `ctx.*` 服务分布在哪些子系统里。
- [[插件开发入门]] 解释如何真正写一个插件。
