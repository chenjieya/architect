---
author: ai
ai_editable: true
summary: '解释 DeepSeek Harness 中 profile、组合包和 patch 如何共同决定一次 dsh 启动时加载哪些插件。'
refs:
  pages:
    - DeepSeek Harness 总览
    - 插件化架构与 Cordis
    - 插件开发入门
  raw:
    - path: raw/DeepSeek Harness/03-参考/01-概念/00-架构.md
      sha256: 780397de376e4c53170ea7deb56915cf90e5d6605b5f685e6c21e49a3ec9937a
updated_by: ai
updated: 2026-08-19
---

DeepSeek Harness 启动时，不是写死“加载这一堆模块”。它会根据 profile、组合包和 patch 拼出一棵插件树。

小白可以把它理解成“配电脑”：

- profile 像一套整机方案，比如 Web 版、无界面版。
- 组合包像一批预装硬件和软件。
- patch 像用户自己的加装和替换配置。

最终运行起来的 `dsh`，就是这些层叠加后的结果。

## 1. profile 是什么

profile 是一套具名运行方案。

DeepSeek Harness 官方提到的典型 profile 有：

| profile    | 用途                         |
| ---------- | ---------------------------- |
| `web`      | 启动带 Web UI 的交互式 Agent |
| `headless` | 启动一次性运行器，不带服务器 |

profile 负责列出要叠哪些组合包，也保存用户安装的树外插件和自己的 `cordis.patch.yml`。

换句话说，profile 回答的是：**这次我要以什么形态运行 Agent？**

## 2. 组合包是什么

组合包是可分发的插件组合。

比如基础组合包会放入模型适配器、工具、持久化、沙箱、审批策略、设置、凭据、遥测等能力。Web 组合包再额外加入浏览器应用相关能力。Headless 组合包则提供无界面的一次性运行能力。

它不是一个“功能函数”，而是一批 Cordis 配置项和挂载代码。

## 3. patch 是什么

patch 是覆盖层。

如果 profile 和组合包决定了“默认装什么”，patch 就决定“我要改掉什么、加上什么”。

官方架构里提到的叠加顺序是：

```text
空配置
  -> profile 列出的组合包
  -> profile 自己的 cordis.patch.yml
  -> home 级 cordis.patch.yml
  -> 命令行 --patch overlay
```

越后面的层级越靠近用户，所以更适合做本地调整。

## 4. 为什么要分这么多层

这样拆分是为了同时满足两件事：

1. 默认体验要简单：用户执行 `dsh web` 就能启动一套完整 Web Agent。
2. 高级定制要灵活：开发者可以用 patch 替换模型、工具、沙箱、UI 节点或其他插件。

如果没有这些层，系统只能在“全写死”和“全手配”之间二选一。profile + 组合包 + patch 则把默认配置和用户定制分开。

## 5. 看实际配置树

官方文档给出的命令是：

```sh
dsh --profile web --dump-config
```

它会打印实际启动时的配置树。你可以把它当成“最终装机清单”：真正运行的不是某个单独文件，而是所有组合和 patch 叠完后的结果。

## 6. 和插件系统的关系

[[插件化架构与 Cordis]] 讲的是“插件怎么工作”，本页讲的是“哪些插件会被装进去”。

两者关系是：

```text
profile / bundle / patch 决定插件树长什么样
Cordis 负责按依赖加载插件
插件通过 ctx 注册服务、工具、事件监听器
Agent 运行时使用这些服务完成对话和工具执行
```

所以，如果以后你要修改 DeepSeek Harness 的能力，第一步通常不是改 Agent 循环，而是先问：这个能力应该作为哪个插件、放进哪个组合包、通过哪个 patch 启用。
