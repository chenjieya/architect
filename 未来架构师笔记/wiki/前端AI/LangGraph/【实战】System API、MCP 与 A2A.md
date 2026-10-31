---
author: ai
ai_editable: true
summary: 'Agent Server 除了业务接口，还提供服务化能力：用 System API 做健康检查与监控，把 Agent 暴露成 MCP 工具，并通过 A2A 与异构 Agent 协作。'
refs:
  pages:
    - 【实战】Assistant API 与子图
    - 【基础】MCP 协议
    - 【实战】Agent 接入 MCP
  raw:
    - path: raw/langgraph-python/22. System API.ipynb
      sha256: 25a3ace2993f9005e970e0757248a62bb6de637741b5c05ad2dd7637cc224640
    - path: raw/langgraph-python/23. MCP API.ipynb
      sha256: 611a717c096f37bb678d03c5b5be54ae1ec7def62c1d88067ad0cb2e14de5cba
    - path: raw/langgraph-python/36. A2A协议.ipynb
      sha256: 1ceddf3d0af1d3591dc00aec2b0ea4ee5ccd3e417c4b837919d423d84a4d16d4
    - path: raw/langgraph-python/assets/A2A-旅游协作.svg
      sha256: 1232b4fc6ab9251be13bd610798b4133af1e4a9418cf4d56a729786a215530e6
updated_by: ai
updated: 2026-10-31
---

一个 Agent 服务上线后，除了"能对话"，还要回答三个问题：**服务活着吗？它和别的 Agent 怎么互通？别的系统怎么把它当工具用？** 分别对应 System API、A2A 与 MCP。

## 1. System API：运维视角

`langgraph-sdk` 当前没有封装 System 接口，统一走 `client.http`：

```python
from langgraph_sdk import get_client

client = get_client(url="http://localhost:2024")
```

| 接口           | 作用                                       |
| -------------- | ------------------------------------------ |
| `GET /ok`      | 健康检查，`check_db=1` 时顺带检查数据库    |
| `GET /info`    | 服务器版本、库版本、功能开关、部署元数据   |
| `GET /metrics` | 监控指标，支持 prometheus 与 json 两种格式 |
| `GET /docs`    | Swagger / OpenAPI 文档页                   |

```python
await client.http.get("/ok", params={"check_db": 1})

info = await client.http.get("/info")
print(info["version"], info["langgraph_py_version"], info["flags"])

metrics = await client.http.get("/metrics", params={"format": "json"})
```

### 1.1 为什么 Prometheus 格式要绕一层

`client.http.get` 会把响应体当 JSON 解析。Prometheus 是纯文本、`/docs` 是 HTML，直接调用会解析失败，需要退回原始 `httpx` 客户端：

```python
r = await client.http.client.get("/metrics", params={"format": "prometheus"})
print(r.text[:1000])
```

部署时把 `/ok` 接到负载均衡的健康检查探针即可；指标接入 Prometheus 后可以监控队列长度、Worker 数量、HTTP 请求等。

## 2. MCP：把 Agent 变成工具

MCP 规定 **Agent 如何与异构工具通信**，原理见 [[【基础】MCP 协议]]。Agent Server 自带 MCP 服务端，只要在 MCP 客户端里填：

```text
http://127.0.0.1:2024/mcp/
```

就能把这个 Agent 当作一个 MCP 工具使用。可以用官方 Inspector 验证：

```bash
npx -y @modelcontextprotocol/inspector@1.0.0
```

这样"别人调用我的 Agent"和"我的 Agent 调用 MCP 工具"就形成对称：反向接入方式见 [[【实战】Agent 接入 MCP]]。

## 3. A2A：Agent 与 Agent 协作

- **MCP**：规定 Agent 与异构 **工具** 如何通信。
- **A2A**：规定 Agent 与异构 **Agent** 如何通信。

| 项目     | 内容                            |
| -------- | ------------------------------- |
| 通信协议 | HTTP(S)                         |
| 消息格式 | JSON-RPC                        |
| 官网     | https://a2a-protocol.org/       |
| 服务端   | Agent Server 自动生成，无需手写 |

![](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/obsidian/1793426540381_A2A-旅游协作.svg)

### 3.1 创建 A2A 服务器

先创建一个专门对外提供能力的 Assistant：

```python
assistant = await client.assistants.create(
    graph_id="agent",
    name="poet-agent",
    description="可以编写不同风格的诗文",
    context={
        "system_prompt": "你必须使用子代理生成诗文，并至少调用一次 ask_user_question 确认需求",
    },
    metadata={"user_id": "a2a"},
)
assistant_id = assistant["assistant_id"]
```

### 3.2 Agent Card

A2A 服务会暴露一个描述自身能力的 **Agent Card**，标准路径是：

```text
/.well-known/agent-card.json?assistant_id={assistant_id}
```

调用方先读这张卡片，知道对方能做什么、怎么调用，再发起协作。Assistant 的概念与版本管理见 [[【实战】Assistant API 与子图]]。

### 3.3 什么时候用 A2A

当"能力"本身也是一个 Agent（有自己的模型、提示词、工具和记忆）时，用 A2A 比把它拆成 MCP 工具更自然：双方保留各自的运行时与上下文，只交换任务和结果。
