---
author: ai
ai_editable: true
summary: '用 mcp 官方 SDK 的 FastMCP 三步写出一个 MCP 服务器：FastMCP 实例化、@mcp.tool() 装饰器定义工具、mcp.run(transport="streamable-http") 启动；并解决 Jupyter 下阻塞问题（独立线程运行），最后用 Inspector 验证服务。'
refs:
  pages:
    - 【基础】MCP 协议
    - 【实战】Agent 接入 MCP
    - 【对比】Skill 与 MCP 的区别与选型
  raw:
    - path: raw/agent-core/27. 实现MCP服务器/课件.ipynb
      sha256: 8d64302536baf001bd5759ec04191b88056d6dab48e7bd6ac5d389b561fe83b3
updated_by: ai
updated: 2026-10-03
---

前面都是"用别人的 MCP 服务器"。这一篇反过来，用官方 SDK 写一个自己的 MCP 服务器，把任意 Python 逻辑暴露成标准工具。

## 1. 安装与导入

```shell
uv add mcp==1.28.1
```

```python
from mcp.server.fastmcp import FastMCP
```

## 2. 定义 MCP 服务器

`FastMCP` 是官方提供的高层封装，实例化即可：

```python
mcp = FastMCP(
    "Weather Service",
    json_response=True,
)
```

- 第一个参数是服务名。
- `json_response=True` 让工具返回值以 JSON 形式对外传递，便于模型解析。

## 3. 定义工具函数

用 `@mcp.tool()` 装饰普通函数，它就变成了可被 MCP 客户端发现的工具：

```python
@mcp.tool()
async def get_weather(city: str = "成都") -> dict[str, str]:
    """Get weather data for a city"""
    return {
        "city": city,
        "temperature": "22",
        "condition": "多云",
        "humidity": "65%",
    }
```

- **函数名 + 文档字符串**：前者是工具名，后者是工具描述，客户端 `tools/list` 时能直接看到。
- **类型注解**：SDK 会据此生成 `inputSchema`，模型知道参数格式。
- **支持 async**：涉及网络或 IO 的工具可以直接写成协程。

真实的天气数据可以接第三方免费 API，这里返回固定值只为演示协议。

## 4. 启动服务

```python
# mcp 库底层使用 starlette + uvicorn 启动 http 服务
mcp.run(transport="streamable-http")
```

`mcp.run` 会阻塞当前线程，启动一个 HTTP 服务（底层是 starlette + uvicorn）。这正好适合作为独立脚本运行。

### 4.1 在 Jupyter 里运行

Jupyter 的单元格不能长时间阻塞，否则界面会卡死。把 `run` 丢到独立线程：

```python
import threading


def run():
    """在独立线程中运行服务器"""
    mcp.run(transport="streamable-http")


t = threading.Thread(target=run)
t.start()
```

> 这和第 [[【实战】MCP Client 封装]] 里用独立线程跑异步是同一个思路：**给阻塞/异步逻辑单独开一个线程，避免干扰主环境**。

## 5. 测试服务

服务起来后，用官方 Inspector 连上去验证：

```shell
npx -y @modelcontextprotocol/inspector@1.0.0
```

在界面里填好连接地址，就能看到 `get_weather` 工具、它的 `inputSchema`，并直接发起 `tools/call` 试跑——和客户端代码看到的效果完全一致。

## 6. MCP 服务器通用模板

把上面的步骤固化下来，就是写任何 MCP 服务器的骨架：

```python
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("My Service", json_response=True)


@mcp.tool()
async def my_tool(param: str) -> dict:
    """工具描述，会展示给模型"""
    return {"ok": True, "param": param}


if __name__ == "__main__":
    mcp.run(transport="streamable-http")
```

换成 stdio 传输只要把 `transport` 改成 `"stdio"`，就能作为本地进程被客户端启动。

## 7. 总结

- **FastMCP**：几行代码就能起一个标准 MCP 服务器。
- **`@mcp.tool()`**：把普通函数暴露为工具，函数名/文档/类型注解自动变成工具名/描述/schema。
- **`mcp.run`**：默认阻塞，适合独立脚本；Jupyter 中用独立线程运行。
- **Inspector**：验证工具发现与调用的可视化工具。

到这里，客户端、接入、服务端三段都齐了。但 Skill 和 MCP 看起来都在"给 Agent 加能力"，到底该用哪个？下一篇专门辨析：[[【对比】Skill 与 MCP 的区别与选型]]。
