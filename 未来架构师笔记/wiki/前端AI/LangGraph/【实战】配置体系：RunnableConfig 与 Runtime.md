---
author: ai
ai_editable: true
summary: '同一张图如何适配不同模型、提示词与工具？本文讲清 RunnableConfig 的读取、动态模型参数、Runtime/Context 的注入方式，以及两者不要混用的原因。'
refs:
  pages:
    - 【基础】模型接入与消息体系
    - 【基础】模拟模型与测试
    - 【实战】Assistant API 与子图
    - 【概念】上下文工程
  raw:
    - path: raw/langgraph-python/14. 模型配置的动态切换.ipynb
      sha256: c32d8133c41b0f563f9d573976e0cd0f0ec7c146f320a8129faadb5ef1ede300
    - path: raw/langgraph-python/15. RunnableConfig.ipynb
      sha256: 4949bf298062e90725ee369b6504360e091719c4343e7ef4f24d31384943f94d
    - path: raw/langgraph-python/16. Runtime.ipynb
      sha256: 4a64ea7fb522d6022abc32bdf9c4383541c5915d4ee2eec99c3a803431518be0
    - path: raw/langgraph-python/assets/RunnableConfig.svg
      sha256: d88215d3b42d7e7a3b97f74e8528fa57ed7cf93f0bd01a829859931a734655c3
updated_by: ai
updated: 2026-10-31
---

如果每换一个模型、每改一句系统提示词都要重新编译一张图，Agent 根本没法做成产品。LangGraph 提供了两条注入自定义配置的渠道：`RunnableConfig` 和 `Runtime.context`。理解它们，才能让"同一张图 + 不同配置 = 不同助手"。

![](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/obsidian/1793426525404_RunnableConfig.svg)

## 1. RunnableConfig：随执行流动的配置

`RunnableConfig` 是一个字典，跟着每一次 `invoke` 传播到所有可执行对象。节点可以通过两种方式拿到它：

```python
from langchain_core.runnables import RunnableConfig, ensure_config

def node_di(state, config: RunnableConfig):
    return {}

def node_ensure(state):
    config = ensure_config()
    return {}
```

- 参数注入：节点签名里声明 `config: RunnableConfig`，框架自动传入。
- 主动获取：在函数内部调用 `ensure_config()`。

### 1.1 常用字段

| 字段                           | 作用                             |
| ------------------------------ | -------------------------------- |
| `configurable`                 | 用户自定义键值，最常用           |
| `configurable.thread_id`       | 指定线程                         |
| `configurable.max_concurrency` | 单个超步内并行任务上限           |
| `recursion_limit`              | 单次 Run 的超步上限，默认 1000   |
| `tags`                         | 给运行打标签，便于追踪过滤       |
| `metadata`                     | 自定义元数据（LangSmith 追踪用） |
| `callbacks`                    | 回调处理器                       |
| `run_name` / `run_id`          | 运行名称与 ID                    |

```python
await graph.ainvoke(
    input={"messages": [HumanMessage("现在什么时间")]},
    config={
        "configurable": {"model": "fake", "system_prompt": "你是一名金融分析师"},
        "recursion_limit": 3,
        "tags": ["金融分析", "fake model"],
        "metadata": {"env": "dev"},
        "run_name": "金融 Agent",
    },
)
```

## 2. 动态切换模型参数

创建模型时声明哪些字段允许运行时覆盖：

```python
model = init_chat_model(
    model_provider="anthropic",
    model="claude-sonnet-4-5",
    configurable_fields=["model", "temperature", "top_p", "thinking"],
)
```

调用时通过 `configurable` 覆盖：

```python
await model.ainvoke(
    [HumanMessage("你好")],
    config={"configurable": {
        "model": "qwen3-max",
        "temperature": 0.5,
        "top_p": 0.9,
        "thinking": {"type": "disabled"},
    }},
)
```

图内同理：节点里的模型工厂读取 `config["configurable"]`，就能在"真实模型"和 `fake` 模拟模型之间切换。模拟模型见 [[【基础】模拟模型与测试]]。

### 2.1 还可以动态决定什么

- **系统提示词**：从状态里移除固定提示词，节点运行时按配置生成，避免改一句提示词就重编译。
- **工具列表**：配置传入工具名数组，节点按名字查出工具再 `bind_tools`。

这样就得到一条重要等式：**Assistant = 图 + 配置**。服务端的 Assistant 正是在这层配置之上再做版本管理，见 [[【实战】Assistant API 与子图]]。

## 3. Runtime：官方推荐的新方式

LangGraph 现在更推荐用 `context` 注入业务配置，用 `runtime.context` 读取；`config.configurable` 主要保留给 `thread_id` 这类运行时参数。

```python
from pydantic import BaseModel, Field
from langgraph.runtime import Runtime

class ContextSchema(BaseModel):
    user_id: str = Field(description="用户 id")
    locale: str = Field(default="zh-CN", description="语言偏好")

def greet(state, runtime: Runtime[ContextSchema]):
    user_id = runtime.context.user_id
    locale = runtime.context.locale
    return {}

builder = StateGraph(State, context_schema=ContextSchema)
```

调用时传 `context`：

```python
await graph.ainvoke(input={}, context=ContextSchema(user_id="张三"))
```

好处是配置有 Schema、有校验、有默认值，比随手塞进 `configurable` 更可控。多租户、按用户注入偏好这类场景尤其合适，长期记忆也会用到，见 [[【基础】Store 与长期记忆]]。

## 4. 最佳实践：只选一种，不要混用

- 新项目一律使用 `context`。
- 旧项目原来用 `configurable` 就继续用，不要中途混搭。
- 使用 Agent Server 时两者不能混用，官方建议统一走 `context`。

`context` 的组织方式与上下文工程的思想一致：不是把所有东西都塞给模型，而是在合适的时机注入合适的配置，见 [[【概念】上下文工程]]。
