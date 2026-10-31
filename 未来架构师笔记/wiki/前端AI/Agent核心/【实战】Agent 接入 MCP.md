---
author: ai
ai_editable: true
summary: '把 MCP 接入 Agent 的四个动作：用独立的 .agents/mcp.json 管理服务器配置；把 MCP 调用包装成 use_mcp 工具并注册；在渲染系统提示词时动态列出所有 MCP 服务器及工具，让模型知道有哪些外部工具可用；最后 Agent 无需改动即可调用。'
refs:
  pages:
    - 【基础】MCP 协议
    - 【实战】MCP Client 封装
    - 【实战】Skill 技能系统
    - 【实战】封装 Tool Calling
  raw:
    - path: raw/agent-core/26. Agent接入MCP/课件.ipynb
      sha256: d2d8ae9287d2de2a719968cbf2a145ecdc80a603dd74d685e736832b99e90dee
    - path: raw/agent-core/26. Agent接入MCP/agent/tool/use_mcp.py
      sha256: a4e1c8589ba823841abe129c46377d5cb266a77cf23bdf5b4460f8eb0d53add3
    - path: raw/agent-core/26. Agent接入MCP/agent/prompt.py
      sha256: c5913d44facbadac8ab6c30564d7bdc2393b00012c54d70a82b9a6592eed85e1
    - path: raw/agent-core/26. Agent接入MCP/agent/prompt/system.j2
      sha256: 69283657763a7e61e8d753ab4f4464139b68a4094d84570f9d96bcc67b66dfed
    - path: raw/agent-core/26. Agent接入MCP/agent/.agents/mcp.json
      sha256: 33d319ab06b9405fddd085644087099ca476cc74fef8fa0b3c8eb6af54143e73
    - path: raw/agent-core/26. Agent接入MCP/assets/mcp.svg
      sha256: 32e6821213dd0b8f77da1138808107f81590f8d0238c1c58189748e25246ad3f
updated_by: ai
updated: 2026-10-03
---

![](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/obsidian/1791013343055_mcp.svg)

[[【实战】MCP Client 封装]] 做出了一个能连服务器、调工具的 `MCPClient`，但它还只是个独立模块。这一篇把它真正接进 Agent，让模型能够自主发现并调用 MCP 服务器上的工具。

## 1. MCP 独立配置

服务器配置不该硬编码在代码里。抽出一个 JSON 文件 `agent/.agents/mcp.json`：

```json
{
  "servers": {
    "time": { "type": "stdio", "command": "uvx", "args": ["mcp-server-time"] },
    "microsoft-learn": {
      "type": "http",
      "url": "https://learn.microsoft.com/api/mcp"
    }
  }
}
```

好处：

- **配置与代码分离**，换服务器不用改 Python。
- **增删服务器只动 JSON**，与 Skill 的目录约定风格一致。

`use_mcp.py` 启动时读取它：

```python
_mcp_config_path = os.path.join(os.path.dirname(__file__), "..", ".agents", "mcp.json")
with open(_mcp_config_path, "r", encoding="utf-8") as _f:
    mcp = json.load(_f)
```

## 2. 把 MCP 调用包装成工具

Agent 只认得注册表里的工具，所以要把"调用 MCP"这件事本身变成一个工具 `use_mcp`：

```python
_client = MCPClient(mcp)


def list_mcp_tools():
    return _client.list_tools()


@tool(
    server_name="mcp服务器的名称",
    tool_name="工具名称",
    arguments="工具参数，无参工具可以不用传递",
)
def use_mcp(server_name: str, tool_name: str, arguments: dict = None):
    return _client.call_tool(server_name, tool_name, arguments)
```

设计要点：

- **一个工具撬动所有 MCP 工具**：不必为每个远程工具都写一个本地函数，`use_mcp` 作为统一入口，靠 `server_name` + `tool_name` 定位。
- **`list_mcp_tools()`**：把"有哪些服务器、各自有哪些工具"暴露出来，供第 3 步注入提示词。
- **注册进注册表**（`tool/__init__.py` 中一并注册），Agent 创建 `Session` 时会自动带上它的 schema。

## 3. 把 MCP 清单注入系统提示词

模型不可能凭空知道有哪些 MCP 工具，必须告诉它。`prompt.py` 新增 `list_mcp_info()`，把工具清单整理成 JSON：

```python
def list_mcp_info() -> str:
    try:
        from agent.tool.use_mcp import list_mcp_tools

        raw = list_mcp_tools()
        result = []
        for item in raw:
            server_name = item["server"]
            tools = []
            for t in item["tools"].tools:
                tools.append(
                    {
                        "name": t.name,
                        "description": t.description or "",
                        "inputSchema": t.inputSchema,
                    }
                )
            result.append({"server": server_name, "tools": tools})
        return json.dumps(result, ensure_ascii=False, indent=2)
    except Exception:
        return ""
```

渲染模板时传入：

```python
def render_prompt(prompt_name: str) -> str:
    template_dir = os.path.join(os.path.dirname(__file__), "prompt")
    env = Environment(loader=FileSystemLoader(template_dir))
    template = env.get_template(f"{prompt_name}.j2")
    return template.render(
        cwd=get_cwd(),
        os=get_os(),
        is_git=get_is_git(),
        skills=list_skills(),
        mcp_servers=list_mcp_info(),
    )
```

系统提示词模板里增加 MCP 章节，把清单以 JSON 形式注入：

```markdown
# MCP

MCP（Model Context Protocol）是一种标准化的工具接入协议……

## 如何使用 MCP 工具

当你需要调用 MCP 工具时，可以使用 `use_mcp` 工具，传入 `server_name`、`tool_name` 以及可选的 `arguments`。

## 当前可用的 MCP 服务器及工具

{{ mcp_servers }}
```

> 注意这里的取舍：MCP 工具清单是**全量注入**的。工具越多，提示词越长。这是 MCP 相比 [[【实战】Skill 技能系统]] 的短板之一，后文 [[【对比】Skill 与 MCP 的区别与选型]] 会专门讨论。

## 4. 效果验证

Agent 侧代码一行都不用改：

```python
from agent.agent import Agent
from agent.printer import ModelPrinterListener

listener = ModelPrinterListener()
agent = Agent(model_listener=listener)
agent.invoke("当前时间是？")
agent.session.save()
```

运行时 Agent 会读取系统提示词里注入的 MCP 清单，发现 `time` 服务器有 `get_current_time` 工具，于是调用 `use_mcp("time", "get_current_time", {...})`，拿到结果后再组织回答。

## 5. 总结

- **配置独立**：`mcp.json` 存放服务器列表，与代码解耦。
- **统一入口**：`use_mcp` 一个工具即可调用任意 MCP 服务器上的任意工具。
- **清单注入**：`list_mcp_info()` 在渲染系统提示词时列出所有可用 MCP 工具。
- **零改动接入**：注册后 Agent 自动获得 MCP 能力。

客户端与接入都通了。最后一环是自己做服务端：[[【实战】实现 MCP 服务器]]。
