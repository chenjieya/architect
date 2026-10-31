---
author: ai
ai_editable: true
summary: 'LangGraph 是 LangChain 生态里的流程引擎。本文梳理 langchain-core、langchain、langgraph、deepagents 的分工，给出学习顺序、两种部署模式与全系列知识地图。'
refs:
  pages:
    - 【基础】核心概念与执行模型
    - 【实战】Agent Server 与线程检查点
    - 【概念】图工程
  raw:
    - path: raw/langgraph-python/01. 必看导言.md
      sha256: 080bf397ec4ee78a67d51db6c31079f89e4664eb4c9b0093d42ad20f5118e576
    - path: raw/langgraph-python/12. 部署模式和学习重心.md
      sha256: 06ac475b9c28f39220a87221d032072a9e307e3817c02e41caeb2e6666767069
    - path: raw/langgraph-python/38. 课程总结.md
      sha256: 411b1e7f54c052ae7316e96c080c5086e688fbab719e076fc2608106d44d8ba8
    - path: raw/langgraph-python/assets/依赖关系.excalidraw
      sha256: b94b7cbf2345b54d36a1650697a00b4fd93c916876519aefdb8dd1e53c5c9106
updated_by: ai
updated: 2026-10-31
---

LangGraph 不是又一个"提示词框架"，它解决的是 **Agent 的流程与状态管理**：把一次智能任务拆成节点和边，用共享状态在节点之间传递数据，并在需要时暂停、恢复、回放。它和 [[【概念】图工程]] 讲的思想一脉相承，只是把"画图"落成了可运行的 Python 代码。

## 1. 定位：LangChain 生态的四层分工

| 包               | 角色         | 解决的问题                                 |
| ---------------- | ------------ | ------------------------------------------ |
| `langchain-core` | 底层数据结构 | 消息、Runnable、配置、回调等基础类型       |
| `langgraph`      | 流程引擎     | 用状态图编排节点、边、循环、并行、中断     |
| `langchain`      | 模型能力     | 统一不同厂商模型的调用方式，提供工具装饰器 |
| `deepagents`     | Agent 范式   | 在流程引擎之上提供更高层的 Agent 组织方式  |

可以把它理解成一条依赖链：**core 提供砖块，graph 负责搭骨架，langchain 提供模型与工具能力，deepagents 提供成套户型**。

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20261031140054499.png)

## 2. 学习顺序

整体顺序是先打通"模型与消息"，再学"图与状态"，最后进入"服务化与生产化"：

1. 模型、消息、Reducer：先把单个节点里发生了什么搞清楚。
2. 核心概念、超步、线程与检查点：理解图怎么运行、状态怎么保存。
3. 配置体系（RunnableConfig、Runtime）：让同一张图适配不同场景。
4. Agent Server 与各类 API：把图变成一个可被外部调用的服务。
5. 时间旅行、中断、容错、事件流：补上生产环境必需的能力。

## 3. 两种运行模式

同一张图有两种用法，学习重心完全不同：

![](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/obsidian/1793426458529_部署模式.svg)

| 对比项   | Agent Server 模式                | 手动模式                 |
| -------- | -------------------------------- | ------------------------ |
| 编译配置 | 除 checkpointer 外，其余仍需配置 | 全部自己配               |
| 调用配置 | 不需要                           | 全部自己配               |
| 调用之后 | 不需要                           | 全部自己处理             |
| 学习重点 | 核心概念 + Agent Server API      | 核心概念 + LangGraph API |

Agent Server 模式下只需要做两件事：

1. 写出编译好的图结构。
2. 看懂并使用 Agent Server 暴露的 API。

检查点存储、线程管理、运行调度这些"脏活"由服务端接管。具体见 [[【实战】Agent Server 与线程检查点]]。

## 4. 知识地图

### 4.1 底层类型

| 概念             | 一句话说明                                     |
| ---------------- | ---------------------------------------------- |
| `Runnable`       | 一个可以被执行的对象，节点、模型、工具都能是它 |
| `RunnableConfig` | 一次执行携带的配置（线程、回调、递归上限等）   |
| `BaseMessage`    | 所有消息类型的父类                             |

### 4.2 图与状态

| 概念           | 一句话说明                         |
| -------------- | ---------------------------------- |
| `StateGraph`   | 根据状态结构定义并编译图           |
| `State`        | 节点之间共享的数据                 |
| `Reducer`      | 规定某个状态字段如何合并新旧值     |
| 节点 / 边      | 执行任务、决定下一步流向           |
| 超步           | 一轮并行执行中所有可运行节点的集合 |
| `Checkpointer` | 按线程持久化图状态                 |
| `ToolNode`     | 执行模型发出的工具调用             |
| 子图           | 把一张图嵌进另一张图               |
| `Command`      | 一次返回里同时更新状态并控制流向   |
| `Thread`       | 检查点的存储容器                   |
| `Store`        | 跨线程、跨会话的长期存储           |
| `interrupt`    | 暂停图，等待外部输入               |
| `Send`         | 动态创建并行分支                   |

### 4.3 服务化

| 概念            | 一句话说明                         |
| --------------- | ---------------------------------- |
| `langgraph-cli` | 管理本地 Agent Server 的命令行工具 |
| `Assistant`     | 图 + 配置，是运行时的"助手"        |
| `Thread`        | 独立的会话线程                     |
| `Run`           | 在线程上执行的一轮任务             |
| `Crons`         | 按 cron 表达式定时运行             |
| `Store`         | 跨线程存储                         |
| `A2A`           | 与异构 Agent 通信的协议            |
| `MCP`           | 把 Agent 暴露成 MCP 工具           |
| `System`        | 健康检查、服务器信息、监控指标     |
| `Streaming`     | 运行过程中的事件流                 |

## 5. 怎么读这一组笔记

- 想先跑起来：[[【基础】核心概念与执行模型]] → [[【实战】Agent Server 与线程检查点]]。
- 想理解配置：[[【实战】配置体系：RunnableConfig 与 Runtime]]。
- 想接服务：[[【实战】Assistant API 与子图]]、[[【实战】Thread API]]、[[【实战】Run API]]。
- 想做生产级能力：[[【实战】时间旅行]]、[[【基础】容错与错误重试]]、[[【实战】Command、中断与人在回路]]。
