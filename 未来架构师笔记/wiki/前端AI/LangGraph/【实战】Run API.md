---
author: ai
ai_editable: true
summary: 'Run 是一次图调用。本文区分有状态与无状态运行，讲清 create/join/wait 的差异、durability 落盘策略，以及运行记录的查询与批量创建。'
refs:
  pages:
    - 【实战】Thread API
    - 【实战】动态扇出与运行控制
    - 【实战】Agent Server 与线程检查点
  raw:
    - path: raw/langgraph-python/20. Run API.ipynb
      sha256: b8bde0dcea5773b2c35602dec30c47ac2a891845622c34a83b046cdc3b18b1cc
updated_by: ai
updated: 2026-10-31
---

Run 是"图的一次调用"。在 Agent Server 里，运行分两类：

- **有状态运行（Thread Runs）**：绑定某个线程，会产生检查点、更新线程状态，可多轮延续。
- **无状态运行（Stateless Runs）**：不绑定已有线程，服务端临时建线程，结束后默认删除，没有记忆。

## 1. 准备工作

```python
from langgraph_sdk import get_client

client = get_client(url="http://localhost:2024")

thread = await client.threads.create(metadata={"__name__": "Run API"})
thread_id = thread["thread_id"]
assistant_id = "..."  # 已注册的 agent Assistant
```

## 2. 三种调用姿势

| 方式         | SDK                                   | 行为                                |
| ------------ | ------------------------------------- | ----------------------------------- |
| 后台运行     | `client.runs.create(...)`             | 立即返回 `run_id`，不等待完成       |
| 等待已有运行 | `client.runs.join(thread_id, run_id)` | 阻塞等待某个已创建的后台运行结束    |
| 创建并等待   | `client.runs.wait(...)`               | 一步完成创建 + 等待，直接拿最终状态 |

```python
run = await client.runs.create(
    thread_id=thread_id,
    assistant_id=assistant_id,
    input={"messages": [{"role": "user", "content": "你好"}]},
)

final_state = await client.runs.join(thread_id, run["run_id"])

result = await client.runs.wait(
    thread_id=thread_id,
    assistant_id=assistant_id,
    input={"messages": [{"role": "user", "content": "第二个问题"}]},
)
```

`wait` 等价于 `create + join`，只是封装成一个接口。聊天类应用通常用 `wait`；后台批处理、长任务用 `create`，之后再来取结果。

## 3. 创建运行时可配置的字段

| 字段                 | 作用                                                     |
| -------------------- | -------------------------------------------------------- |
| `thread_id`          | 指定线程；传 `None` 即无状态运行                         |
| `assistant_id`       | 使用哪个助手                                             |
| `input`              | 注入的初始状态                                           |
| `metadata`           | 本次运行的元数据，可搜索过滤                             |
| `config` / `context` | 覆盖 Assistant 的配置                                    |
| `after_seconds`      | 延迟多少秒开始运行                                       |
| `if_not_exists`      | 线程不存在时：`reject`（默认报错）/ `create`（自动创建） |
| `durability`         | 检查点写入频率                                           |

### 3.1 durability：可靠性和性能的取舍

| 模式            | 行为                     | 代价                                     |
| --------------- | ------------------------ | ---------------------------------------- |
| `exit`          | 只在图退出时持久化一次   | 最快，但中途崩溃会丢中间状态             |
| `async`（默认） | 下一步执行的同时异步写入 | 兼顾性能与可靠，崩溃可能丢最后一个检查点 |
| `sync`          | 下一步开始前同步写入     | 最可靠，开销最大                         |

### 3.2 run 对象常见字段

- `run_id`、`thread_id`、`assistant_id`；
- `status`：刚创建为 `pending`，之后是 `running` / `success` / `error` / `interrupted` / `cancelled`；
- `metadata`：创建时传入的元数据；
- `kwargs`：本次运行的 input、config、context 等。

## 4. 运行管理

```python
run = await client.runs.get(thread_id, run["run_id"])          # 查状态
runs = await client.runs.list(thread_id, limit=10)             # 列出线程上的运行
runs = await client.runs.list(thread_id, status="success",
                              select=["run_id", "status", "created_at"])
await client.runs.delete(thread_id, run["run_id"])             # 删除记录
```

删除运行记录时，**对应的检查点也会被一并删除**，线程状态会随之回退。

## 5. 无状态运行

不传 `thread_id` 即可：

```python
run = await client.runs.create(thread_id=None, assistant_id=assistant_id,
                               input={"messages": [{"role": "user", "content": "一次性问答"}]})

result = await client.runs.wait(thread_id=None, assistant_id=assistant_id,
                                input={"messages": [{"role": "user", "content": "一次性问答"}]})
```

服务端会为每次运行临时建线程，默认 `on_completion="delete"`，运行完即清理。适合"问一句就走"的接口，不产生任何历史负担。

### 5.1 批量创建

```python
runs = await client.runs.create_batch([
    {"assistant_id": assistant_id, "input": {"messages": [{"role": "user", "content": "批次 1"}]}},
    {"assistant_id": assistant_id, "input": {"messages": [{"role": "user", "content": "批次 2"}]}},
])
```

批量接口只创建无状态后台运行，立即返回列表，适合批量评测、批量生成。

线程本身的增删改查见 [[【实战】Thread API]]；同一个线程上并发多个 Run 时的策略见 [[【实战】动态扇出与运行控制]]。
