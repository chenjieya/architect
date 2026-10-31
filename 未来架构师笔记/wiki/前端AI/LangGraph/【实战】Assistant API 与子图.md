---
author: ai
ai_editable: true
summary: 'Assistant = 图 + 配置，由 Agent Server 统一管理并支持版本回滚。本文列出 SDK 的增删改查接口，并讲清子图的两种通信模式与持久化行为。'
refs:
  pages:
    - 【实战】配置体系：RunnableConfig 与 Runtime
    - 【实战】子代理 Sub Agent
    - 【实战】Thread API
  raw:
    - path: raw/langgraph-python/17. Assistant API.ipynb
      sha256: 5124cbfcac095d9cf34a4983a5f654b1b659edc850221325fcae7f632d37a212
    - path: raw/langgraph-python/18. 子图.md
      sha256: 8b13001dd97f097300de22ffd8e95b1af218657c4b4abf26cacc44d7332d729e
    - path: raw/langgraph-python/assets/子图模式.svg
      sha256: 23f15a083c5d92740a266635caee6eb9cce830178171cfc25fa82b97ee1845e4
updated_by: ai
updated: 2026-10-31
---

一张图只是"能力模板"，真正对外提供服务时还需要一份配置：用哪个模型、什么提示词、允许多少超步。**图 + 配置 = Assistant**。Agent Server 把这份组合持久化，并给它加上版本号。

## 1. Assistant 是什么

前面 [[【实战】配置体系：RunnableConfig 与 Runtime]] 讲过：同一张图换一套 `context` / `config` 就是另一个助手。Assistant 就是把"图 id + 配置"存成一条记录，供后续 Run 引用。

- `graph_id`：用哪张图；
- `context`：注入图运行时的静态上下文；
- `config`：运行配置，例如 `recursion_limit`；
- `name` / `description` / `metadata`：管理与检索用，不影响功能。

## 2. 用 SDK 管理 Assistant

```python
from langgraph_sdk import get_client

client = get_client(url="http://localhost:2024")
```

| 操作            | SDK 方法                                    | HTTP                             |
| --------------- | ------------------------------------------- | -------------------------------- |
| 创建            | `client.assistants.create(...)`             | `POST /assistants`               |
| 获取            | `client.assistants.get(id)`                 | `GET /assistants/{id}`           |
| 更新            | `client.assistants.update(id, ...)`         | `PATCH /assistants/{id}`         |
| 版本列表        | `client.assistants.get_versions(id)`        | `POST /assistants/{id}/versions` |
| 设为最新版本    | `client.assistants.set_latest(id, version)` | `POST /assistants/{id}/latest`   |
| 搜索 / 列表     | `client.assistants.search(...)`             | `POST /assistants/search`        |
| 统计            | `client.assistants.count()`                 | `POST /assistants/count`         |
| 图结构          | `client.assistants.get_graph(id)`           | `GET /assistants/{id}/graph`     |
| 输入输出 Schema | `client.assistants.get_schemas(id)`         | `GET /assistants/{id}/schemas`   |
| 删除            | `client.assistants.delete(id)`              | `DELETE /assistants/{id}`        |

```python
assistant = await client.assistants.create(
    graph_id="agent",
    name="假模型",
    description="最多允许 10 个超步",
    context={"model": "fake"},
    config={"recursion_limit": 10},
)
assistant_id = assistant["assistant_id"]
```

### 2.1 版本机制

- **创建**时生成 `version=1`。
- **更新**不是原地修改，而是生成一个新版本并设为最新。
- **set_latest** 可以把任意历史版本重新设为最新，实现回滚。

```python
v2 = await client.assistants.update(
    assistant_id,
    description="最多允许 20 个超步",
    config={"recursion_limit": 20},
)

await client.assistants.set_latest(assistant_id, version=1)  # 回滚
```

这带来一个很实用的能力：调参时不改代码，只更新 Assistant；出问题就回滚版本。

### 2.2 搜索与统计

```python
await client.assistants.search(graph_id="agent", limit=10)
await client.assistants.search(
    limit=2, offset=0, sort_by="created_at", sort_order="desc",
    select=["assistant_id", "name", "created_at"],
)
await client.assistants.count()
```

`select` 只返回需要的字段，列表页场景能明显减少传输量。

## 3. 子图：把一张图嵌进另一张图

子图是复用复杂流程的主要手段，例如把"写诗""查资料"各自封装成独立图，再由主图调度。

![](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/obsidian/1793426532097_子图模式.svg)

### 3.1 两种通信模式

1. **共享状态**：子图与父图使用相同的状态结构，主图直接把状态传进去。适合子图只是父流程的一段。
2. **独立状态**：子图有自己的状态结构，通过输入输出做转换。适合子图是独立能力、需要和其他调用方共用。

### 3.2 持久化行为

子图自动继承父图的检查点存储方式，**不需要单独配置存储后端**。但可以控制持久化粒度：

```python
sub_graph.compile(checkpointer=持久化行为取值)
```

| 模式             | `checkpointer=` | 行为                                                 |
| ---------------- | --------------- | ---------------------------------------------------- |
| 每次调用（默认） | `None`          | 每次从头开始，继承父级检查点以支持单次调用中的中断   |
| 每线程           | `True`          | 同一线程上的多次调用累积状态，从上次停下的地方继续   |
| 无状态           | `False`         | 完全没有检查点，像普通函数调用，不支持中断与持久执行 |

### 3.3 子 Agent 模式

把"调用子 Agent"做成一个工具，是更常见的用法：

1. 不同子 Agent 使用**同一张图的不同配置**；
2. 主 Agent 通过调用工具触发子 Agent；
3. 通信方式：在节点内部调用子图；
4. 持久化：`None`，每次独立执行。

这种模式与 [[【实战】子代理 Sub Agent]] 的思路一致：把大任务拆给子代理，只回传结论，避免主上下文被中间过程撑爆。

子图不能做时间旅行，原因与检查点边界有关，见 [[【实战】时间旅行]]。
