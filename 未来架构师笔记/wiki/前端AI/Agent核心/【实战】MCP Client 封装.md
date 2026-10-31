---
author: ai
ai_editable: true
summary: '用 MCP 官方 Python SDK 手写 MCP Client：stdio 与 http 两种传输的连接样板，封装成 connect_mcp 异步上下文管理器，再用 MCPClient 类统一管理多个服务器；最后用独立线程包一层同步 API，绕开 Jupyter 已有事件循环的限制。'
refs:
  pages:
    - 【基础】MCP 协议
    - 【实战】Agent 接入 MCP
  raw:
    - path: raw/agent-core/25. MCP Client/课件.ipynb
      sha256: 7130e35cb8ed5b9736f75a694bb0016278607dd8d4e5324396620d6a32b9d86c
    - path: raw/agent-core/25. MCP Client/agent/tool/use_mcp.py
      sha256: de47c22957facb254da95e4ec904fd0e2b47eec509d93dd67849df40b537a1c8
updated_by: ai
updated: 2026-10-03
---

[[【基础】MCP 协议]] 讲了 MCP 的"标准长什么样"，这一篇动手把它落到代码里：用官方 Python SDK 连接 MCP 服务器、发现工具、调用工具，最后封装成一个便于在 Agent 里使用的 `MCPClient`。

## 1. 安装 SDK

```shell
uv add mcp==1.28.1
```

## 2. 最原始的连接样板

### 2.1 stdio：定义服务器参数

stdio 方式的服务器本质是一个本地命令，需要告诉 SDK"用哪个命令、带什么参数启动"：

```python
from mcp import StdioServerParameters

server_params = StdioServerParameters(
    command="uvx",  # 用 uv 运行服务器
    args=["mcp-server-time"],
)
```

### 2.2 stdio：发现工具

```python
from mcp.client.stdio import stdio_client
from mcp import ClientSession

async with stdio_client(server_params) as (read, write):
    async with ClientSession(read, write) as session:
        # initialize
        await session.initialize()
        # tools/list
        tools = await session.list_tools()
        print(tools.model_dump_json(indent=2, ensure_ascii=False))
```

三步对应协议里的三条消息：连接 → `initialize()` 握手 → `list_tools()` 发现工具。

### 2.3 stdio：调用工具

```python
async with stdio_client(server_params) as (read, write):
    async with ClientSession(read, write) as session:
        await session.initialize()
        # tools/call
        tools = await session.call_tool(
            name="get_current_time",
            arguments={"timezone": "Asia/shanghai"},
        )
        print(tools.model_dump_json(indent=2, ensure_ascii=False))
```

### 2.4 http：换一种传输

远程 HTTP 服务器（如微软文档服务）用法几乎一样，只是把 `stdio_client` 换成 `streamable_http_client`：

```python
from mcp.client.streamable_http import streamable_http_client
from mcp import ClientSession

async with streamable_http_client("https://learn.microsoft.com/api/mcp") as (
    read_stream,
    write_stream,
    _,
):
    async with ClientSession(read_stream, write_stream) as session:
        await session.initialize()
        tools = await session.list_tools()
        print(tools.model_dump_json(indent=2, ensure_ascii=False))
```

调用工具同理：

```python
tools = await session.call_tool(
    name="microsoft_docs_search",
    arguments={"query": "c#如何解析excel"},
)
```

## 3. 封装第一步：connect_mcp

每次手写 `stdio_client` / `ClientSession` / `initialize` 太啰嗦，而且两种传输方式的样板几乎重复。用一个异步上下文管理器统一：

```python
from contextlib import asynccontextmanager


@asynccontextmanager
async def connect_mcp(server_config: dict):
    """根据配置连接 MCP 服务器，返回已初始化的 ClientSession"""
    if server_config["type"] == "stdio":
        params = StdioServerParameters(
            command=server_config["command"],
            args=server_config.get("args", []),
        )
        async with stdio_client(params) as (read, write):
            async with ClientSession(read, write) as session:
                await session.initialize()
                yield session
    elif server_config["type"] == "http":
        async with streamable_http_client(server_config["url"]) as (read, write, _):
            async with ClientSession(read, write) as session:
                await session.initialize()
                yield session
    else:
        raise ValueError(f"不支持的服务器类型: {server_config['type']}")
```

调用方只需关心配置字典，不用再记两种传输的样板：

```python
async def list_server_tools(server_config: dict):
    async with connect_mcp(server_config) as session:
        return await session.list_tools()


async def call_server_tool(server_config: dict, tool_name: str, arguments: dict | None = None):
    async with connect_mcp(server_config) as session:
        return await session.call_tool(tool_name, arguments or {})
```

## 4. 封装第二步：MCPClient 管理多个服务器

配置里通常不止一个服务器，手动传 `mcp["servers"]["xxx"]` 依然繁琐。用 `MCPClient` 把配置收进来：

```python
class MCPClient:
    def __init__(self, config: dict):
        self.servers = config["servers"]

    async def alist_tools(self) -> list:
        """异步：获取所有服务器的工具列表"""
        results = []
        for name, config in self.servers.items():
            async with connect_mcp(config) as session:
                tools = await session.list_tools()
                results.append({"server": name, "tools": tools})
        return results

    async def acall_tool(self, server_name: str, tool_name: str, arguments: dict | None = None):
        """异步：调用指定服务器上的工具"""
        config = self.servers[server_name]
        async with connect_mcp(config) as session:
            return await session.call_tool(tool_name, arguments or {})
```

配置示例：

```python
mcp = {
    "servers": {
        "time": {"type": "stdio", "command": "uvx", "args": ["mcp-server-time"]},
        "microsoft-learn": {
            "type": "http",
            "url": "https://learn.microsoft.com/api/mcp",
        },
    }
}
```

## 5. 封装第三步：同步 API

Agent 的代码大多是同步的，但 SDK 是异步的。`asyncio.run()` 能直接跑协程并返回结果，但它要求"当前没有别的事件循环在跑"。Jupyter 自己维护了一个事件循环，直接调用会报错。

解决办法：**把异步代码丢进一个独立线程**。每个线程有自己独立的事件循环，在新线程里 `asyncio.run()` 不受 Jupyter 主循环影响。

```python
import threading


def run_async(coro):
    """在独立线程中运行异步协程，同步等待并返回结果"""
    result = None
    error = None

    def _run():
        nonlocal result, error
        try:
            result = asyncio.run(coro)
        except Exception as e:
            error = e

    t = threading.Thread(target=_run)
    t.start()
    t.join()

    if error:
        raise error
    return result
```

给 `MCPClient` 补上同步方法：

```python
    def list_tools(self) -> list:
        """同步：获取所有 MCP 服务器的工具列表"""
        return run_async(self.alist_tools())

    def call_tool(self, server_name: str, tool_name: str, arguments: dict | None = None):
        """同步：调用指定服务器上的工具"""
        return run_async(self.acall_tool(server_name, tool_name, arguments))
```

> 注意：`run_async` 每次调用都会新建线程并 `join`，属于"一次性"的桥接。高频调用场景下应改用长驻事件循环或直接在异步环境里工作。

## 6. 使用

```python
client = MCPClient(mcp)

all_tools = client.list_tools()
for item in all_tools:
    print(f"\n===== {item['server']} =====")
    print(item["tools"].model_dump_json(indent=2, ensure_ascii=False))

result = client.call_tool("time", "get_current_time", {"timezone": "Asia/Shanghai"})
print(result.model_dump_json(indent=2, ensure_ascii=False))
```

到这里，一个能发现工具、调用工具、同时管理多个服务器的 MCP Client 就成型了。但它还只是个独立工具——下一篇把它接进 Agent：[[【实战】Agent 接入 MCP]]。

## 7. 总结

- **SDK 用法**：`StdioServerParameters` 定义 stdio 服务器；`stdio_client` / `streamable_http_client` + `ClientSession` 完成连接；`initialize` / `list_tools` / `call_tool` 对应三条协议消息。
- **`connect_mcp`**：用 `@asynccontextmanager` 抹平 stdio 与 http 的样板差异。
- **`MCPClient`**：聚合多服务器，暴露 `list_tools` / `call_tool`。
- **同步桥接**：用独立线程 + `asyncio.run` 解决 Jupyter 事件循环冲突。
