---
author: ai
ai_editable: true
summary: 'Command 同时改状态和决定走向，interrupt 让图停在任意位置等待外部输入。本文讲清四个参数、恢复流程、HITL 契约与五条避坑实践。'
refs:
  pages:
    - 【基础】状态与 Reducer
    - 【实战】Agent Server 与线程检查点
    - 【实战】事件流
    - 【概念】驾驭工程
  raw:
    - path: raw/langgraph-python/27. Command.md
      sha256: 893b87a41835c2c78a80070124317c0bc4c2d2f588331c2846491cba58c456ef
    - path: raw/langgraph-python/28. 中断.ipynb
      sha256: 621ed22203ff3c0215f2b5df7878746b702c86f0bd5dfec686edbad46e6ef7fe
    - path: raw/langgraph-python/29. 人在回路.md
      sha256: 7b5d4f12620c6cfa461267447f822dd90ca0c5ba3d55d83e05ebe5efb010fca0
    - path: raw/langgraph-python/assets/interrupt原理.svg
      sha256: 85f4c02db5e73f3a18ba68ca02a2c1f65c1779fff19fa54705bdb8d7022d4fca
    - path: raw/langgraph-python/assets/中断恢复.svg
      sha256: 511d992d665b140f0b0a4abdc39a0628e61dce30ad0f4c4dc857a400357732f5
updated_by: ai
updated: 2026-10-31
---

图默认是"节点返回状态、边决定流向"。`Command` 把这两件事合成一个返回值；`interrupt` 则让图在执行途中停下来，把决定权交给外部。两者组合，就是人工审批、信息补全这类 **人在回路（HITL）** 的基础。

## 1. Command：一次返回，两件事

```python
def node(state):
    return {"foo": "bar"}

# 等价于
def node(state):
    return Command(update={"foo": "bar"})
```

### 1.1 可以用在三个地方

1. **节点返回**：更新状态，同时指定下一跳。
2. **工具函数返回**：工具直接改写图状态，例如写入长期记忆。
3. **图调用**：`graph.invoke(input=Command(...))`，用于恢复中断。

工具里可以通过依赖注入拿到运行时信息：

```python
@tool
def search(query: str, runtime: ToolRuntime[ContextSchema, StateSchema]) -> Command:
    call_id = runtime.tool_call_id
    state = runtime.state
    ctx = runtime.context
    return Command(update={"last_query": query})
```

### 1.2 四个参数

| 参数     | 作用                         | 节点/工具返回 | 图调用 |
| -------- | ---------------------------- | ------------- | ------ |
| `update` | 更新图状态                   | ✅            | ❌     |
| `goto`   | 指定下一个节点（动态边）     | ✅            | ❌     |
| `graph`  | 跳到父图的节点（子图内使用） | ✅            | ❌     |
| `resume` | 恢复中断                     | ❌            | ✅     |

```python
def node(state):
    return Command(
        update={"status": "done"},
        goto="node_b",
        graph=Command.PARENT,
    )
```

注意一个容易踩的点：**节点的静态边和 `goto` 动态边都会执行**。如果你既写了 `add_edge` 又返回 `goto`，可能出现两条路径同时被触发的情况。

## 2. interrupt：停在任意位置

### 2.1 原理

`interrupt(value)` 在节点执行到这一行时抛出内部异常，框架捕获后：

1. 保存当前检查点；
2. 把 `value` 作为"待处理的中断"暴露给调用方；
3. 结束这次运行，状态标记为 `interrupted`。

恢复时，节点会**从头重新执行**，`interrupt()` 这一次返回外部传入的值，而不是再次暂停。

![[interrupt原理.svg]]

![[中断恢复.svg]]

### 2.2 查看中断

中断信息有两个来源：

```python
interrupts = result.get("__interrupt__", [])       # 本次运行返回
cur = graph.get_state(config)
cur.interrupts                                     # 最新检查点里
```

Agent Server 上则是：

```python
result = await client.runs.wait(thread_id=thread_id, assistant_id=assistant_id, input={})
interrupts = result.get("__interrupt__", [])
state = await client.threads.get_state(thread_id)
state["interrupts"]
```

### 2.3 恢复

手动模式：

```python
from langgraph.types import Command

answers = {inter.id: True for inter in interrupts}
result = await graph.ainvoke(input=Command(resume=answers), config=config)
```

Agent Server：

```python
from langgraph_sdk.schema import Command as SDKCommand

answers = {inter["id"]: True for inter in interrupts}
result = await client.runs.wait(
    thread_id=thread_id,
    assistant_id=assistant_id,
    command=SDKCommand(resume=answers),
)
```

`resume` 按中断 id 传值。一次可以同时恢复多个并行分支的中断，本轮运行会跑到下一个中断为止。

## 3. 人在回路：ask_user_question 的契约

HITL 的典型实现是一个"询问用户"的工具。工具、中断、回复三方要约定好结构：

![[29-human-in-the-loop.png]]

**工具参数契约**

```json
{
  "question": "你希望使用哪种数据库？",
  "options": [
    {
      "title": "PostgreSQL",
      "description": "功能完善，适合生产环境",
      "recommended": true
    },
    {
      "title": "MySQL",
      "description": "使用广泛，生态成熟",
      "recommended": false
    },
    {
      "title": "SQLite",
      "description": "无需单独部署，适合本地开发",
      "recommended": false
    }
  ]
}
```

**中断契约**

```json
{
  "type": "ask_user_question",
  "question": "你希望使用哪种数据库？",
  "options": ["..."]
}
```

**回复契约**：纯字符串，例如 `PostgreSQL`。

前端拿到中断后渲染选项卡，用户选择后把字符串作为 `resume` 值传回，工具重新执行并拿到这个值，流程继续。

## 4. 五条避坑实践

1. **不要捕获 `interrupt` 异常**，至少不要吞掉 `GraphBubbleUp`，否则中断机制失效。
2. **被中断的节点恢复时会重新执行**，中断前的副作用（写库、发消息、扣费）必须幂等。
3. **一个节点内多次中断时，数量与顺序必须稳定**，否则恢复值会对不上。
4. **子图的 `checkpointer` 必须是 `None` 或 `True`**，否则父图无法正常中断。
5. **时间旅行会重新触发中断**，回放时要预留处理逻辑。

恢复之后的运行同样可以流式观察，见 [[【实战】事件流]]；人工审批这类"最小权限"设计属于 [[【概念】驾驭工程]] 讨论的护栏范畴。
