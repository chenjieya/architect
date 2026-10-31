---
author: ai
ai_editable: true
summary: 'Thread 是持久化状态的容器。本文按增删改查、搜索、复制、状态与历史、指定检查点、清理的顺序，列出 langgraph_sdk 的线程接口。'
refs:
  pages:
    - 【实战】Agent Server 与线程检查点
    - 【实战】Run API
    - 【实战】时间旅行
    - 【基础】会话管理
  raw:
    - path: raw/langgraph-python/19. Thread API.ipynb
      sha256: 11921d0ea8a20ec4a1d5d56f4c27dd667de460defb247d593e2225cd0b0da106
updated_by: ai
updated: 2026-10-31
---

Agent Server 把"线程"做成了 HTTP 资源：创建、查询、复制、清理都能通过接口完成。Thread 本质上是一串检查点的容器，也就是一段可恢复的会话。

```python
from langgraph_sdk import get_client

client = get_client(url="http://localhost:2024")
```

## 1. 创建线程

```python
thread = await client.threads.create(
    metadata={"title": "新会话", "user_id": "007", "graph_id": "agent"},
)
thread_id = thread["thread_id"]
```

`metadata` 是自定义字段，可用于后续搜索与过滤。两个冷门字段：

- `ttl`：线程存活时间，到期自动清理；
- `supersteps`：初始化时直接写入每个检查点的状态，用于导入历史。

## 2. 查询与更新

| 操作 | SDK 方法                                           | HTTP                      |
| ---- | -------------------------------------------------- | ------------------------- |
| 获取 | `client.threads.get(thread_id)`                    | `GET /threads/{id}`       |
| 更新 | `client.threads.update(thread_id, metadata={...})` | `PATCH /threads/{id}`     |
| 搜索 | `client.threads.search(...)`                       | `POST /threads/search`    |
| 统计 | `client.threads.count()`                           | `POST /threads/count`     |
| 复制 | `client.threads.copy(thread_id)`                   | `POST /threads/{id}/copy` |
| 删除 | `client.threads.delete(thread_id)`                 | `DELETE /threads/{id}`    |

获取线程时几个重要字段：

- `status`：`idle` / `busy` / `interrupted` / `error`；
- `values`：当前图状态，未运行过为 `None`；
- `config`：最新运行使用的配置；
- `state_updated_at`：最近一次产生检查点的时间。

更新采用**合并**语义：只传 `metadata` 中的部分键，旧键仍保留。

## 3. 搜索与复制

```python
await client.threads.search(metadata={"user_id": "007"}, limit=10)

await client.threads.search(
    limit=5, offset=0, sort_by="created_at", sort_order="desc",
    select=["thread_id", "status", "created_at"],
)

copy_thread = await client.threads.copy(thread_id)  # 连状态和检查点一起复制
```

复制线程是调试利器：拿一段真实运行过的会话，复制一份随便折腾，原线程不受影响。做时间旅行演示时经常这么准备数据。

## 4. 状态与历史

```python
state = await client.threads.get_state(thread_id)          # 最新检查点
history = await client.threads.get_history(thread_id, limit=10)  # 每个超步一条

state = await client.threads.get_state(thread_id, checkpoint_id="...")  # 指定检查点
```

`get_state` 的关键字段：

| 字段                | 含义                                  |
| ------------------- | ------------------------------------- |
| `values`            | 图的最新状态                          |
| `next`              | 下一步要执行的节点，空列表表示已结束  |
| `tasks`             | 排队或执行中的任务                    |
| `checkpoint`        | 检查点信息（id、thread_id、命名空间） |
| `parent_checkpoint` | 上一个检查点                          |
| `interrupts`        | 当前挂起的中断                        |
| `metadata.step`     | 超步序号                              |

历史列表里每条对应一个检查点，按 `checkpoint_id` 可以精确回溯。时间旅行的 Replay/Fork 就建立在这两个接口上，见 [[【实战】时间旅行]]。

## 5. 清理与删除

```python
await client.threads.prune(thread_ids=[thread_id], strategy="keep_latest")
await client.threads.delete(thread_id)
```

- `prune(strategy="delete")`：删除整个线程；
- `prune(strategy="keep_latest")`：只清理旧检查点，保留线程和最新状态；
- `delete`：删除线程及其全部检查点，再查会抛 `NotFoundError`。

## 6. 补充：子图接口

```python
await client.assistants.get_subgraphs(assistant_id)
await client.assistants.get_subgraphs(assistant_id, namespace="child:graph")
```

这两个接口只返回**结构化定义**的子图节点。通过工具动态调用编译出来的子图不算结构化子图，因此没有结构化子图时返回空对象。

线程上执行的每一轮任务由 [[【实战】Run API]] 管理；线程与检查点的原理见 [[【实战】Agent Server 与线程检查点]]。
