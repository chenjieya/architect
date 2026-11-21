---
author: ai
ai_editable: true
summary: 'Command 与 interrupt 的组合用法与幂等要求，补全 ToolNode 的输入与参数分发、ValidationError 处理，以及同一工具并发中断的坑与 Send 拆任务方案。'
refs:
  pages:
    - 【基础】状态与 Reducer
    - 【基础】工具与工具节点
    - 【实战】Agent Server 与线程检查点
    - 【实战】事件流
    - 【实战】动态扇出与运行控制
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

### 2.2 为什么中断前必须幂等

因为恢复时节点是**从头再跑一遍**，不是从 `interrupt()` 那一行继续。所以 `interrupt()` 之前的代码，用户每回复一次，就会再执行一次。

```python
def node(state):
    order = create_order(state)      # 中断前：每次恢复都会再执行
    ans = interrupt({"order": order})
    return {"answer": ans}
```

如果 `create_order` 里写库、发消息、扣款，那么中断几次、恢复几次，副作用就重复几次。**检查点只保存图的状态，不会回滚数据库、消息、支付这些外部副作用。**

幂等不是说“执行后什么都不变”，而是：

> **执行 1 次和执行 N 次，最终结果一样，副作用不会叠加。**

不幂等：

```python
db.insert({"id": state["order_id"], "status": "created"})  # 每恢复一次多一条
```

幂等：

```python
db.upsert({"id": state["order_id"], "status": "created"})  # 同一个 id 重复执行结果一样
```

或者把写操作挪到中断之后：

```python
ans = interrupt("确认下单吗？")
if ans == "yes":
    db.insert(...)   # 只在中点之后写，恢复时不会重复插入
```

更稳的做法是用唯一业务键或 `runtime.tool_call_id` 去重，或者在状态里记一个 `order_created=True`，恢复时跳过。

还有一个容易忽略的点：不只是 `interrupt()` **前面**的代码会重跑。只要节点里还有后续的 `interrupt()`，恢复时同样会从节点开头再跑一遍。所以最保守的规则是：

> **带 `interrupt()` 的节点，整体都要能安全重复执行；至少 `interrupt()` 之前的代码必须幂等。**

### 2.3 查看中断

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

### 2.4 恢复

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

## 4. ToolNode 到底做了什么

用 `ask` 工具举例，AI 返回几个 `tool_calls`，ToolNode 就做几件事：

1. 取出 `tool_calls`。
2. 有多个就并发执行。
3. 每个调用按 `name` 找到对应工具，把 `args` 交给它。
4. 工具用自己的 Pydantic 模型校验参数。
5. 参数错 → 包成 error `ToolMessage`；参数对 → 执行工具 → 结果包成 `ToolMessage`。

### 4.1 ToolNode 接受什么

常见有三种输入：

| 输入形式     | 长什么样                                                | 输出                             |
| ------------ | ------------------------------------------------------- | -------------------------------- |
| 图状态       | `{"messages": [AIMessage(..., tool_calls=[...])]}`      | `{"messages": [ToolMessage...]}` |
| 消息列表     | `[AIMessage(..., tool_calls=[...])]`                    | `[ToolMessage...]`               |
| 直接工具调用 | `[{"name": "ask", "args": {"q": "A"}, "id": "call_A"}]` | `[ToolMessage...]`               |

默认从最后一条 `AIMessage` 的 `tool_calls` 里取调用；如果工具返回 `Command`，输出里会是 `Command` 或 `ToolMessage` 与 `Command` 的混合列表。

### 4.2 AI 的参数怎么落到对应工具

每个 `tool_call` 就三个关键字段：

```python
{"name": "ask", "args": {"q": "A"}, "id": "call_A"}
```

ToolNode 初始化时会把工具做成一张表：

```python
tools_by_name = {"ask": ask_tool}
```

执行时按 `name` 查表：

```python
tool = tools_by_name.get(call["name"])
```

- `name` 找不到：返回 error `ToolMessage`，内容会列出可用工具名。
- 找到了：把 `call["args"]` 交给工具；`@tool` 生成的 `args_schema`（Pydantic 模型）负责校验和类型转换。
- `id`：原样写进结果的 `ToolMessage.tool_call_id`，这样每条结果都知道自己对应哪个调用。
- `state`、`store`、`runtime` 这类参数不是 AI 给的，由 ToolNode 注入。

### 4.3 ValidationError 怎么变成 Message

参数缺失或类型不对时，Pydantic 先抛 `ValidationError`，然后 ToolNode 把它包装成 `ToolInvocationError`，默认错误处理再把它变成一条 `ToolMessage`：

```text
AI 给了错误参数
→ Pydantic 抛 ValidationError
→ ToolNode 包装成 ToolInvocationError
→ 默认错误处理捕获它
→ 返回 ToolMessage(status="error")
→ 下一条 AI 消息能看到这个错误
```

例如调用 `ask` 少了 `q`：

```text
Error invoking tool 'ask' with kwargs {} with error:
 q: Field required
```

但默认只兜这一种：

| 错误                                            | 默认行为                          |
| ----------------------------------------------- | --------------------------------- |
| 参数校验失败（`ValidationError`）、工具名不存在 | 包成 error `ToolMessage`，还给 AI |
| 工具代码自己抛 `ValueError`、`TimeoutError` 等  | **不包**，直接抛，节点失败        |
| `interrupt()` 的内部异常                        | **永远不包**，必须让它冒泡        |

一句话：**`ValidationError` 会被包成 Message，普通运行异常不会，`interrupt` 更不能。**

## 5. 同一个 ask 工具被并发调用，才是重灾区

你说的场景不是“多个不同工具”，而是 **AI 一次返回了两个 `ask` 调用，而 `ask` 里面有 `interrupt`**。这时 ToolNode 会把同一个工具并发跑两次。

```python
tool_calls = [
    {"name": "ask", "args": {"q": "A"}, "id": "call_A"},
    {"name": "ask", "args": {"q": "B"}, "id": "call_B"},
]
```

接下来发生的事：

1. ToolNode 同时执行 A、B 两次 `ask`。
2. A 调 `interrupt()`，B 也调 `interrupt()`。
3. 运行时只把第一个中断交出来，另一个被盖住；这一次**不会返回任何 `ToolMessage`**。
4. 恢复时 ToolNode **从头再跑 A、B**，不是只跑被中断的那个。
5. resume 值按 interrupt 出现顺序配对，**不按 `call_A` / `call_B` 配对**；并发下顺序不稳，A/B 的答案可能对调。
6. 两个中断的 id 还可能相同（都来自同一个 ToolNode 任务），`Command(resume={id: value})` 也分不开。

实测 langgraph 1.2.10：两个 `ask` 并行，第一次只出现 `q=A`，恢复后才出现 `q=B`，两次中断 id 相同。

混合情况更麻烦：

- 一个 `ask` 中断 + 一个 `ask` 参数错：第一次只看到中断，参数错误被盖住；恢复后才一起返回“成功 + error ToolMessage”。
- 两个 `ask` 都参数错：两个 error ToolMessage 都正常返回，没有中断。
- 一个 `ask` 中断 + 一个 `ask` 运行时报错：谁先冒出来不稳定，另一个结果丢掉。

所以结论很硬：**同一个带 `interrupt` 的工具，不能并发调用。**

### 5.1 怎么办

1. 一次只让模型返回一个工具调用：`parallel_tool_calls=False`。
2. 把 `interrupt` 从工具里拿出来，做成单独节点，一次只问一个问题。
3. 要一次问多个问题，就只调用一次 `interrupt`，把问题放进数组：`interrupt({"questions": [...]})`，恢复时用业务 id 映射答案。
4. 工具里用 `runtime.tool_call_id` 做幂等，防止恢复重跑时重复副作用。

### 5.2 真的要并发：用 Send 拆任务

如果确实要同时问多个问题，不要把多个调用塞进同一个 ToolNode，而是用 **动态扇出（`Send`）**，让每个 `ask` 变成**独立任务**：

```python
from langgraph.types import Send


def fan_out(state):
    return [Send("ask_node", {"q": q}) for q in state["questions"]]


builder.add_node("ask_node", ask_node)
builder.add_conditional_edges(START, fan_out, ["ask_node"])
```

每个 `Send` 都会创建一个独立任务，**中断作用域也跟着独立**。这样：

- 多个 `ask` 可以同时停下，`__interrupt__` 里会出现多个中断；
- 每个中断有自己的 id，可以一次性用 `Command(resume={id: 答案})` 分别恢复；
- 不会出现“同一个 ToolNode 任务里只露第一个中断”的问题。

实测 langgraph 1.2.10：两个 `Send` 分支各自中断，返回两个不同的中断 id，用 id 映射一次恢复后，两个结果都正确写回。

`Send` 的完整用法、结果汇合与并发控制见 [[【实战】动态扇出与运行控制]]。

## 6. 另外三个容易忘的点

- `interrupt` 必须配 `checkpointer`，否则暂停后没有现场可恢复。
- 被中断的节点恢复时整体重跑，中断前的副作用必须幂等。
- 时间旅行会重新触发中断，回放时要预留处理逻辑。

恢复之后的运行同样可以流式观察，见 [[【实战】事件流]]；人工审批这类"最小权限"设计属于 [[【概念】驾驭工程]] 讨论的护栏范畴。

## 7. 延伸阅读

- [[LangGraph中断]]：结合 AI 漫剧人工审核，深入 interrupt 的异常暂停、检查点恢复与节点整体重放。
- [[01 目录]]：AI 漫剧工作流项目目录（中断用于分镜人工审核）。
