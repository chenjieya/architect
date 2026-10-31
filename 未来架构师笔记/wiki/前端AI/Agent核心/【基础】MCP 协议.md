---
author: ai
ai_editable: true
summary: 'MCP（Model Context Protocol）定义 Agent 与外部工具之间的通信标准：客户端（通常是 Agent）与服务端（工具提供者）通过 stdio 或 http 传输，用 JSON-RPC 2.0 交换 initialize / tools/list / tools/call 等消息。本文讲清协议内核、调试工具与服务器生态。'
refs:
  pages:
    - 【LLM】MCP：理论知识
    - 【LLM】MCP：Schema
    - 【LLM】MCP：Client
    - 【LLM】MCP：远程通信方式
    - 【实战】Agent 接入 MCP
  raw:
    - path: raw/agent-core/24. MCP协议/课件.md
      sha256: 4c23de19318dc20fbf3b4f31e19dceaeae9616dfeda4de258c34d8864c3c82cf
updated_by: ai
updated: 2026-10-03
---

前面给 Agent 加工具，都是把 Python 函数写在本项目里。可现实中的工具五花八门：公司内部的订单系统、数据库、支付接口、别人的服务……如果每家都自己定一套接法，Agent 就得为每个工具写一套适配代码。**MCP 就是为了终结这种混乱而生的通信标准。**

> MCP 定义的是 **Agent** 和 **外部工具** 之间的**通信标准**，官方站点：https://modelcontextprotocol.io/

## 1. 协议内核

标准包含三部分：**谁和谁通信、怎么通信、用什么格式通信**。

### 1.1 通信角色

- **客户端 MCP Client**：发起方，通常是 Agent。
- **服务端 MCP Server**：工具提供方，对外暴露一个个可调用的工具。

一个 Agent 可以同时连接多个 MCP Server，把来自不同服务器的工具统一纳入自己的能力集合。

### 1.2 通信方式（传输层）

- **stdio**：通过 stdin / stdout 在本地进程间通信。适合本地命令行工具，启动快、无需网络。
- **http**：通过 HTTP 协议通信。适合远程服务，可跨机器、跨网络。

### 1.3 通信格式

上层统一使用 **JSON-RPC 2.0**，每条消息是一个 JSON 对象：

```json
{
  "jsonrpc": "2.0",
  "id": "req-123",
  "method": "tools/call",
  "params": { "...": "..." }
}
```

- `jsonrpc`：协议版本，固定为 `"2.0"`。
- `id`：请求标识，用于把响应和请求对应起来。
- `method`：要执行的方法，如 `tools/list`。
- `params`：方法参数。

因为是标准格式，任何实现了这套协议的程序都能互相通信，无需为彼此写适配层。

## 2. 客户端：谁来当 MCP Client

任何匹配 MCP 协议的程序都可以作为 MCP Client。调试阶段常用官方提供的 **Inspector**：

```shell
npx -y @modelcontextprotocol/inspector@1.0.0
```

它启动一个可视化界面，能清楚看到客户端与服务端之间的每一次通信内容——排查"工具为什么没被发现""参数为什么传错"时非常好用。

当然，真正干活时，MCP Client 通常就是你自己写的 Agent。

## 3. 服务端：现成的工具从哪来

MCP 已经有庞大的生态，聚合站收录了海量现成服务器：

- [awesome-mcp-servers](https://github.com/punkpeye/awesome-mcp-servers)
- [mcp.so](https://mcp.so/zh)
- [smithery.ai](https://smithery.ai/servers)
- [glama.ai](https://glama.ai/)

适合练手的官方示例服务器是 **time**：

```shell
uvx mcp-server-time
```

它是微软官方文档的 MCP 服务，可直接作为远程 HTTP 服务接入：

```text
https://learn.microsoft.com/api/mcp
```

## 4. 通信内容：三次核心交互

一次典型的 MCP 会话，核心就三条消息：

| 内容         | 备注                       |
| ------------ | -------------------------- |
| `initialize` | 初始化，协商协议版本与能力 |
| `tools/list` | 发现该服务器提供哪些工具   |
| `tools/call` | 调用某个工具并拿到结果     |

用大白话串起来就是：

1. **握手**：客户端说"我来了，我们能怎么聊"（`initialize`）。
2. **摸底**：客户端问"你有哪些工具、参数长什么样"（`tools/list`）。
3. **干活**：客户端说"帮我执行这个工具，参数是这些"（`tools/call`）。

Agent 因此可以**动态发现**工具，而不是把工具清单硬编码在代码里。

## 5. 总结

- **MCP 是什么**：Agent 与外部工具之间的通信标准，让人不用为每个工具写适配。
- **角色**：Client（发起方，通常是 Agent）与 Server（工具提供方）。
- **传输**：本地用 stdio，远程用 http。
- **格式**：JSON-RPC 2.0。
- **三条核心消息**：`initialize` 握手、`tools/list` 发现、`tools/call` 调用。

协议懂了，下一步就是写代码。先实现客户端并封装成一个好用的类：[[【实战】MCP Client 封装]]。
