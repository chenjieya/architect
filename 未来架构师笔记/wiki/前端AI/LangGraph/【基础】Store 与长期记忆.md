---
author: ai
ai_editable: true
summary: 'Checkpointer 管单线程状态，Store 管跨线程长期数据。本文讲清 namespace/key/value 模型、两套读写 API，以及长期记忆的四个改造步骤。'
refs:
  pages:
    - 【实战】Agent Server 与线程检查点
    - 【实战】配置体系：RunnableConfig 与 Runtime
    - 【概念】上下文工程
    - 【基础】会话管理
  raw:
    - path: raw/langgraph-python/34. Store.ipynb
      sha256: d38bea98f29af87c108f8b497e659cd12627b0c3acbfb78be4a7a9fddc49b09b
    - path: raw/langgraph-python/35. 长期记忆.ipynb
      sha256: de08a82ef1c14f5da6e6c0a01109ec7fea083b342b7dc0d54f7ab411970fdcf0
    - path: raw/langgraph-python/assets/长期记忆-简单处理.svg
      sha256: cef579039dceb1afdcd8641dba0b184e9718dd980581100f6aef5d901f539c0d
updated_by: ai
updated: 2026-10-31
---

Checkpointer 保存的是**某个线程**的图状态，线程之间彼此隔离。但真实应用还需要"用户上次说过喜欢简洁回答""这个用户的职业是工程师"这类**跨线程、跨会话**的信息。这就是 Store 的职责。

一句话区分：**Checkpointer 记一次对话怎么走到现在，Store 记用户是谁、偏好什么。**

## 1. Store 的数据模型

一条数据由三部分组成：

- `namespace`：命名空间，用元组表示，相当于目录；
- `key`：命名空间内的唯一标识；
- `value`：真正保存的数据，必须是字典。

```text
Store
└── ("users", "user_001", "memory")
    ├── profile      → { name, city, job }
    └── preferences  → { language, response_style }
```

## 2. LangGraph API

```python
from langgraph.store.memory import InMemoryStore

store = InMemoryStore()
namespace = ("users", "user_001", "memory")
```

| 操作         | 方法                                                           |
| ------------ | -------------------------------------------------------------- |
| 写入 / 覆盖  | `await store.aput(namespace, key=..., value={...})`            |
| 查单条       | `await store.aget(namespace, key=...)`                         |
| 查多条       | `await store.asearch(namespace)`                               |
| 查子命名空间 | `await store.alist_namespaces(prefix=("users",), max_depth=4)` |
| 删除         | `await store.adelete(namespace, key=...)`                      |

```python
await store.aput(namespace, key="profile",
                 value={"name": "张三", "city": "上海", "job": "Python 工程师"})

profile = await store.aget(namespace, key="profile")

items = await store.asearch(namespace)
[(item.key, item.value) for item in items]

namespaces = await store.alist_namespaces(prefix=("users",), max_depth=4)
```

### 2.1 修改就是覆盖

Store 没有单独的 update。用相同 `namespace + key` 再写一次即可，但注意：**整个 value 会被替换，不会自动合并字典**。

```python
await store.aput(namespace, key="profile",
                 value={"name": "张三", "city": "杭州", "job": "AI 工程师"})
```

如果只想改一个字段，先 `aget` 读出来，改完再整体写回。

## 3. Agent Server API

服务端的 Store 不依赖图、Assistant 或 Thread，直接通过 `client.store` 访问：

| 操作         | SDK                                                           | HTTP                       |
| ------------ | ------------------------------------------------------------- | -------------------------- |
| 写入 / 覆盖  | `client.store.put_item(...)`                                  | `PUT /store/items`         |
| 查单条       | `client.store.get_item(namespace, key=...)`                   | `GET /store/items`         |
| 查多条       | `client.store.search_items(namespace)`                        | `POST /store/items/search` |
| 查子命名空间 | `client.store.list_namespaces(prefix=["users"], max_depth=4)` | `POST /store/namespaces`   |
| 删除         | `client.store.delete_item(namespace, key=...)`                | `DELETE /store/items`      |

```python
server_namespace = ("users", "user_002", "memory")

await client.store.put_item(server_namespace, key="profile",
                            value={"name": "李四", "city": "北京", "job": "Python 工程师"})

profile = await client.store.get_item(server_namespace, key="profile")
result = await client.store.search_items(server_namespace)
[(item["key"], item["value"]) for item in result["items"]]
```

服务端存储通常是 Postgres，多实例共享；`InMemoryStore` 只适合本地调试。

## 4. 长期记忆：把 Store 接进图

![](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/obsidian/1793426574158_长期记忆-简单处理.svg)

目标：第一次对话里用户说"请记住我喜欢的电影"，之后的**新线程**也能用上这条信息，同时不同用户互不干扰。

### 4.1 四个改造步骤

1. **新增检查节点 `check`**
   - 检查 `runtime` 里是否存在 `store`；
   - 检查 thread 元数据里是否带 `user_id`。
2. **新增提示词节点**
   - 图状态里增加 `system_prompt` 字段；
   - 首次加载时把 Store 里的长期记忆拼进系统提示词，写入状态。
3. **修改模型节点**
   - 模型节点直接读状态里的 `system_prompt`，不再每次临时拼接。
4. **新增长期记忆工具**
   - 模型判断值得记住时调用工具，按 `user_id` 写入 Store。

### 4.2 关键：系统提示词是"冻结"的

每个线程只在**第一次运行**时构建一次系统提示词，之后一直复用这份快照。因此：

- 第一次运行期间刚写入的记忆，不会出现在**当前线程**的提示词里；
- 新建线程时会重新读取 Store，就能拿到最新记忆。

```python
store = InMemoryStore()
checkpointer = InMemorySaver()
graph = build_graph().compile(store=store, checkpointer=checkpointer)

thread_1 = {"configurable": {"thread_id": "thread-001"}, "metadata": {"user_id": "001"}}
await graph.ainvoke(
    input={"messages": [HumanMessage("请记住：我最喜欢的电影是《宇宙探索编辑部》")]},
    config=thread_1,
    context=ContextSchema(system_prompt="尽量形成长期记忆！"),
)

item = await store.aget(("users", "001"), key="memory")   # 工具写入的结果

thread_2 = {"configurable": {"thread_id": "thread-002"}, "metadata": {"user_id": "001"}}
await graph.ainvoke(
    input={"messages": [HumanMessage("我最喜欢的电影是什么？")]},
    config=thread_2,
    context=ContextSchema(system_prompt="尽量形成长期记忆！"),
)

other = {"configurable": {"thread_id": "thread-003"}, "metadata": {"user_id": "002"}}
await graph.ainvoke(
    input={"messages": [HumanMessage("我最喜欢的电影是什么？")]},
    config=other,
)
```

用一个 `user_id` 作为 Store 命名空间的一部分，天然实现用户隔离。Agent Server 上的流程完全一致，只是把 `metadata` 放在 `client.threads.create(metadata={"user_id": ...})` 里。

### 4.3 为什么不直接塞进对话历史

把长期记忆全放进消息列表会带来两个问题：上下文越来越长、每轮都重复付费。更合理的做法是**只把当前任务相关的记忆取出来**，注入到系统提示词或工具结果里。这正是 [[【概念】上下文工程]] 强调的"按需编排"，也是 [[【基础】会话管理]] 里"历史不可随意修改"的延伸。

运行时如何拿到 `user_id` 这类配置，见 [[【实战】配置体系：RunnableConfig 与 Runtime]]。
