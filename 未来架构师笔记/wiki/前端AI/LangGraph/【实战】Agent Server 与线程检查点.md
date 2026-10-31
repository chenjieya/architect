---
author: ai
ai_editable: true
summary: '用 langgraph-cli 把图跑成 Agent Server，并讲清检查点、线程、run 的关系：检查点何时产生、thread_id 怎么用、状态和历史怎么查。'
refs:
  pages:
    - 【基础】核心概念与执行模型
    - 【实战】Thread API
    - 【实战】Run API
    - 【基础】会话管理
  raw:
    - path: raw/langgraph-python/07. Agent Server.md
      sha256: ccb41f72744a7154b13d3a3e45d0825d4fcbdb437dd93dfe41bf8b65e1582b38
    - path: raw/langgraph-python/09. 线程和检查点.ipynb
      sha256: a5a856da089359af0f356e296e3de26963a3ad8dab0deec825dc97e91b85a011
    - path: raw/langgraph-python/assets/线程.svg
      sha256: 400808fbae0872133f85f9cbc0897e705e1121c299104cab95370ba92d32c311
updated_by: ai
updated: 2026-10-31
---

图和模型一样，默认是"一次性"的：运行结束，状态就没了。但 Agent 需要多轮对话、需要中断后恢复、需要回放历史——这些都依赖**检查点**与**线程**。Agent Server 则负责把图和持久化一起变成可调用的服务。

## 1. 把图跑成 Agent Server

```bash
uv add "langgraph-cli[inmem]==0.4.31"
langgraph --version
```

在工程根目录放一个 `langgraph.json`，声明 Python 版本、依赖来源、图入口和环境变量文件：

```json
{
  "python_version": "3.13",
  "source": { "kind": "uv", "root": "." },
  "graphs": { "agent": "langgraph_python.dev:agent" },
  "env": ".env"
}
```

启动：

```bash
langgraph dev
```

服务默认监听 `http://127.0.0.1:2024`，接口文档在 `/docs`。

### 1.1 两个可视化入口

- **LangSmith Studio**：`https://smith.langchain.com/studio/?baseUrl=http://127.0.0.1:2024`，可以对话、查看图结构和每一步运行轨迹。
- **Agent Chat**：`https://agentchat.vercel.app/`，填入服务地址和 graph id（上面的例子是 `agent`），直接在网页里聊天。

![](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/obsidian/1793426504352_监控平台.svg)

生产环境的部署方式见 [[【实战】Agent 部署]]。

## 2. 线程、检查点与 Run

![](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/obsidian/1793426504353_线程.svg)

四个概念的关系：

- **检查点（checkpointer）**：记录图在某一刻的完整状态。出现位置是**起始节点前后**和**每个超步之后**。
- **线程（thread）**：一组检查点的容器。一个图可以在不同线程上并行运行，状态互不干扰。
- **Run / Turn**：某个线程上，图从开始执行到结束的一整轮。

一句话：**线程上跑 Run，Run 产生多个检查点，每个超步一个。**

### 2.1 手动模式下配置检查点

```python
from langgraph.checkpoint.memory import InMemorySaver

graph = build_graph().compile(checkpointer=InMemorySaver())

config = {"configurable": {"thread_id": "chat-1"}}

await graph.ainvoke(
    input={"messages": [HumanMessage("你好，我叫小明")]},
    config=config,
)
```

第二次调用使用同一个 `thread_id`，节点就能看到上一轮的消息：

```python
await graph.ainvoke(
    input={"messages": [HumanMessage("你知道我是谁吗？")]},
    config=config,
)
```

### 2.2 查看最新状态与历史

```python
latest = graph.get_state(config)            # 最新检查点
history = list(graph.get_state_history(config))  # 全部检查点
```

`get_state` 返回的 `values` 是图状态，`next` 是下一步要执行的节点，`interrupts` 是当前挂起的中断。时间旅行的基础就是这些历史检查点，见 [[【实战】时间旅行]]。

### 2.3 持久化后端

`checkpointer` 支持多种存储：

| 后端            | 适用                           |
| --------------- | ------------------------------ |
| `InMemorySaver` | 本地开发、测试，进程结束即丢失 |
| `PostgresSaver` | 生产环境，多实例共享           |
| `SqliteSaver`   | 单机持久化                     |
| 自定义实现      | 接入已有数据库                 |

## 3. Agent Server 模式下的差异

使用 Agent Server 时有两件事不用自己操心：

1. **不用指定检查点存储**：服务端会自动注入，自己管好 Agent Server 的数据目录即可。
2. **不用手写线程与运行管理**：Thread、Run、Checkpointer 都已经封装成 HTTP API，见 [[【实战】Thread API]] 与 [[【实战】Run API]]。

这也解释了"两种运行模式"的学习重心差异：手动模式要理解 LangGraph 的全部 API，Agent Server 模式只要理解概念和 HTTP 接口。
