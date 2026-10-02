---
author: ai
ai_editable: true
summary: '把 Tool Calling 的五步流水线封装成简洁 API：用 Pydantic 动态生成参数模型与 JSON Schema，用 Tool 类包装函数并提供 @tool 装饰器，再用工具调度中心统一 register / schemas / invoke，实现"定义即注册、一句调用"。'
refs:
  pages:
    - 【实战】Tool Calling
    - 【LLM】Function Calling
  raw:
    - path: raw/agent-core/19. 封装tools/课件.ipynb
      sha256: 5944a5b0aa68c1310096ea0af3dbbc8e56faa034e1c6e1ed147cbbe52916fa5c
    - path: raw/agent-core/19. 封装tools/agent/tool/core/tool.py
      sha256: 3648d435fa1b27abb422d0fe32332cfc9291464f46629063579abe189d3b2f15
    - path: raw/agent-core/19. 封装tools/agent/tool/core/utils.py
      sha256: 71d7942517f13f374e722a93d91cd6c9f313a66578133bf83966439d135c34a7
    - path: raw/agent-core/19. 封装tools/agent/tool/__init__.py
      sha256: f00fe4ebe4741960d8f4354b2df1e8f8f073a104b440984feed1d4f1c6b939bd
    - path: raw/agent-core/19. 封装tools/agent/tool/read_file.py
      sha256: 66f9b15ea32f5ef93f8b0973f4120ec4c2f73e4fa4b74b42ab346ccbc81b8424
    - path: raw/agent-core/19. 封装tools/agent/tool/write_file.py
      sha256: a3039ef66a395f10936fc4b5e97e4f4985d2ecdbf60324ea9a56c09c7a30bdcb
    - path: raw/agent-core/19. 封装tools/assets/tool_calling.svg
      sha256: fbd7ceefbcb5af3998f912581c37f63a38c3f8df3abbc79ae1b5b00161ae40ca
updated_by: ai
updated: 2026-09-26
---

上一篇 [[【实战】Tool Calling]] 把完整流程跑通了，但流程很长：**定义函数 → 手动拼 JSON Schema → 绑定到 `session.tools` → 调用模型 → 执行工具**。每加一个工具就要手写一大段 schema，工具一多就难以维护。这一篇的目标，是把这条流水线封装成简洁优雅的代码。

![](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/obsidian/1790408761637_tool_calling.svg)

## 1. 期望的最终形态

先想清楚"封装好了应该长什么样"，再倒推实现。我们期望：

```python
# 1. Tool 可以包装一个函数，并指定每个参数的描述
tool = Tool(
    read_file,
    param_descriptions={"filepath": "文件路径"}
)

# 2. 调用 tool 和调用原函数行为一致
tool("./uv.md")

# 3. 可以轻松获取 schema
tool.schema  # {"type": "function", "function": {...}}
```

更进一步，希望参数的描述能**贴着函数写**，用装饰器一步到位：

```python
@tool(filepath="文件的绝对路径或相对于cwd的路径", content="待写入的文件内容")
def write_file(filepath: str, content: str) -> None:
    """将内容写入文件"""
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
```

## 2. 再次认识 Pydantic

封装的关键是：**根据函数签名自动生成参数校验模型和 JSON Schema**。这正是 Pydantic 擅长的。

先复习基本用法：

```python
from pydantic import BaseModel, Field

class Counter(BaseModel):
    n: int = Field(description="计数值", default=0)

# 自动适配默认值
Counter()

# 自动转换类型
Counter(n="123")

# 无法转换则报错
Counter(n=[1, 2, 3])

# 转换为字典格式
Counter().model_dump()

# 获取 schema
schema = Counter.model_json_schema()
print(json.dumps(schema, indent=2, ensure_ascii=False))
```

`model_json_schema()` 输出的正好就是工具 schema 需要的 `parameters` 部分：字段类型、描述、必填列表都能拿到。

### 2.1 动态创建模型

但工具是运行时才确定的，不能为每个函数手写一个类。Pydantic 提供 `create_model` 在运行时动态造模型：

```python
from pydantic import create_model

param_model = create_model(
    "dynamic_model",
    filepath=(str, Field(description="文件的绝对路径或相对于cwd的路径")),
    content=(str, Field(description="待写入的文件内容"))
)

schema = param_model.model_json_schema()
print(json.dumps(schema, indent=2, ensure_ascii=False))
```

### 2.2 从函数签名自动生成模型

有了 `create_model`，就能读取函数签名，为每个参数自动建字段：

```python
import inspect
from typing import Any


def create_params_model(func, param_descriptions={}):
    model_name = f"{func.__name__}_params"
    args = {}
    sig = inspect.signature(func)
    for pname, param in sig.parameters.items():
        py_type = param.annotation if param.annotation is not param.empty else Any
        desc = param_descriptions.get(pname, "")

        if param.default is param.empty:
            # 必填参数：不设默认值
            args[pname] = (py_type, Field(description=desc))
        else:
            # 可选参数：设置默认值
            args[pname] = (
                py_type,
                Field(default=param.default, description=desc),
            )

    return create_model(model_name, **args)
```

这段逻辑逐点拆解：

- `inspect.signature(func)`：拿到函数的参数表（名字、类型注解、默认值）。
- `param.annotation`：参数的类型注解；没有注解就退回 `Any`。
- `param.default is param.empty`：判断参数是否必填。必填的不给默认值，可选的带上默认值——**这直接决定了 schema 里的 `required` 列表**。
- `param_descriptions`：外部传入的"参数名 → 描述"映射，最终写进每个字段的 `description`。

验证一下：

```python
param_model = create_params_model(write_file, param_descriptions={
    "filepath": "文件的绝对路径或相对于cwd的路径",
    "content": "待写入的文件内容"
})
schema = param_model.model_json_schema()
print(json.dumps(schema, indent=2, ensure_ascii=False))
```

## 3. 封装 Tool 类

有了 `create_params_model`，`Tool` 类就顺理成章了：

```python
import inspect
import traceback
from typing import Any, Callable
from agent.tool.core.utils import create_params_model


class Tool:

    def __init__(self, func: Callable, param_descriptions: dict = {}):
        self.func = func
        self.name = func.__name__
        self.description = inspect.getdoc(func) or ""
        self.param_descriptions = param_descriptions or {}
        self.param_model = create_params_model(func, param_descriptions)

    def schema(self) -> dict:
        param_schema = self.param_model.model_json_schema()
        return {
            "type": "function",
            "function": {
                "name": self.name,
                "description": self.description,
                "parameters": {
                    "type": "object",
                    "properties": {
                        name: {
                            "type": prop.get("type", "string"),
                            "description": prop.get("description", ""),
                        }
                        for name, prop in param_schema.get("properties", {}).items()
                    },
                    "required": param_schema.get("required", []),
                },
            },
        }

    def __call__(self, **kwargs) -> Any:
        result = ""
        try:
            # 验证参数
            validated = self.param_model(**kwargs)
            result = str(self.func(**validated.model_dump()))
        except Exception as e:
            # 完整堆栈字符串
            result = "".join(traceback.format_exception(type(e), e, e.__traceback__))

        return result
```

三个方法各司其职：

- `__init__`：记住原函数、名字、文档字符串（`inspect.getdoc` 取出来当工具描述），并生成参数模型。
- `schema()`：把 Pydantic 的 schema 翻译成工具协议要求的 `{"type": "function", "function": {...}}` 结构。
- `__call__`：让 `Tool` 实例**像函数一样被调用**。它先用 `param_model` 校验参数，再调原函数；出错时把完整堆栈转成字符串返回——**而不是抛异常**。

> 为什么 `__call__` 要把异常吞掉、返回字符串？因为工具结果最终是要写回模型上下文的。把报错信息当成"工具的输出"喂回模型，模型就能看到"我参数写错了/文件不存在"，从而自我纠正，而不是让整个程序崩掉。

## 4. 实现 @tool 装饰器

`Tool` 类用起来还是有点啰嗦，用装饰器把参数描述贴到函数定义上：

```python
def tool(**args):
    """装饰器：将普通函数包装为 Tool 对象"""

    def decorator(func):
        return Tool(func, param_descriptions=args)

    return decorator
```

于是工具定义变得非常清爽，描述和实现放在一起：

```python
@tool(filepath="文件绝对路径或相对于cwd的路径")
def read_file(filepath: str) -> str:
    """读取文件内容并以字符串形式返回"""
    with open(filepath, "r", encoding="utf-8") as f:
        return f.read()


@tool(filepath="文件绝对路径或相对于cwd的路径", content="待写入的内容")
def write_file(filepath: str, content: str) -> None:
    """将内容写入文件"""
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
```

装饰器执行后，`read_file` 不再是函数，而是一个 `Tool` 实例——但它依然可调用（因为有 `__call__`），并且多了 `.schema()` 能力。

## 5. 封装工具调度中心

现在工具能定义了，但"工具 → session"和"session → 执行工具"之间还差一段胶水代码。用一个**工具调度中心**（注册表）把这段距离补上：

```python
class _ToolRegistry:
    _tools: dict[str, Tool] = {}

    def register(self, tool: Tool):
        """注册一个工具"""
        self._tools[tool.name] = tool

    def schemas(self) -> list[dict]:
        """返回所有工具的 Schema 列表，可直接赋值给 session.tools"""
        return [t.schema() for t in self._tools.values()]

    def invoke(self, message: dict) -> list[dict] | None:
        """从模型返回的消息中提取 tool_calls 并逐一执行"""
        tool_calls = message.get("tool_calls", [])
        if not tool_calls:
            return None
        results = []
        for tc in message.get("tool_calls", []):
            id = tc["id"]
            name = tc["function"]["name"]
            args = json.loads(tc["function"]["arguments"])
            tool = self._tools[name]
            result = ""
            if not tool:
                result = "无此工具，请仔细检查你传递的工具名称是否正确"
            else:
                result = tool(**args)
            results.append({
                "role": "tool",
                "tool_call_id": id,
                "name": name,
                "content": result,
            })
        return results
```

注册表三个能力：

- `register`：登记工具，用名字做键。
- `schemas`：一次性导出所有工具的 schema，直接赋给 `session.tools`。
- `invoke`：从模型消息里取出 `tool_calls`，逐个执行，并把结果组装成 `role="tool"` 的消息（带 `tool_call_id` 关联到具体调用）。没有工具调用时返回 `None`。

把两个工具注册进去：

```python
registry = _ToolRegistry()
registry.register(read_file)
registry.register(write_file)
```

## 6. 完整流程测试

把封装好的东西串起来跑一遍：

```python
from agent.tool import registry
from agent.session import Session
from agent.model import Model
from agent.prompt import render_prompt

session = Session()
model = Model()
session.add_message({"role": "system", "content": render_prompt("system")})

# 1. 注册工具（导出 schema 绑定到会话）
session.tools = registry.schemas()
session.print()

# 2. 发起对话
session.add_message({"role": "user", "content": "请在当前目录新建一个`uv.md`文件，写入UV的安装教程。直接新建就好"})
resp = model.invoke_stream(session)
session.print()

# 3. 执行模型要求的工具
call_msg = registry.invoke(session.messages[-1])
print(call_msg)

# 4. 追加工具结果到上下文
if call_msg:
    session.messages += call_msg
session.print()

# 5. 告知模型结果（模型据此继续回答或再次调用工具）
model.invoke_stream(session)
```

整个流程串起来就是 Agent 的核心循环雏形：**模型决策 → 工具执行 → 结果回喂 → 模型再决策**。第 5 步之后如果模型又发起新的工具调用，重复第 3～5 步，就是后面要讲的 ReAct 循环。

## 7. 总结

- **痛点**：手写 JSON Schema 太啰嗦，工具多了难维护。
- **Pydantic**：`create_model` 动态建模，`model_json_schema` 直接产出参数 schema。
- **`create_params_model`**：读函数签名，自动生成"参数校验 + schema"模型。
- **Tool 类**：包装函数，提供 `schema()` 与 `__call__`；出错返回堆栈字符串而非抛异常。
- **`@tool` 装饰器**：把参数描述贴到函数定义旁，定义即工具。
- **调度中心**：`register` / `schemas` / `invoke` 三件套，打通模型与工具之间的胶水层。

至此，"底层逻辑"阶段里从模型部署、提示词、会话到工具调用的完整链路就通了。下一步是把这套手动循环升级为能自主"思考—行动—观察"的 **ReAct** 模式。
