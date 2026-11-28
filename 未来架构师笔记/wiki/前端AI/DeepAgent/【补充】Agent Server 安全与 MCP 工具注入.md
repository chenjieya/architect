---
author: ai
ai_editable: true
summary: 'Agent Server 的鉴权与隔离：用 Bearer 令牌做身份认证与授权，用隔离键和 Store 命名空间隔离用户数据，并用 MultiServerMCPClient 注入外部工具。'
refs:
  pages:
    - 【基础】MCP 协议
    - 【实战】Agent 接入 MCP
    - 【实战】Thread API
    - 【基础】Store 与长期记忆
  raw:
    - path: raw/langchain-python/34. [补充]身份认证.ipynb
      sha256: 4d0549a7a01a56f71d40465974696db1b01bcf198169fd20daaf789bf7497ddb
    - path: raw/langchain-python/35. [补充]授权.ipynb
      sha256: 2c9fadf7b1aca1419115e1feafe2463c2fb2323ac14ba1dbede5ad6565f3f228
    - path: raw/langchain-python/36. [补充]资源隔离.ipynb
      sha256: fcb98c55e17590129edb1eb48a2ebccedcfbcc8bc73595dce1e64b5cb9a7d83a
    - path: raw/langchain-python/22. MCP工具注入.ipynb
      sha256: 29dddeef51ab00a5ee6c186095cce37cdbdbd445f3d26c7f00c02a9fc81bccd6
    - path: raw/langchain-python/assets/身份认证.svg
      sha256: 24f1d93e5787de8669faa53c2091c79ba724a918ac9fbc75a8ef07b9d9266db1
    - path: raw/langchain-python/assets/身份认证.excalidraw
      sha256: fde21073da25bcede151b08444c56f0ea9f3fc56620ca5ff88e7622df4ca6a94
    - path: raw/langchain-python/assets/授权.svg
      sha256: 366ed6ebad5adffa060471604b3fdd5f1e14b6fabb98cac15165cd1bb1e29403
    - path: raw/langchain-python/assets/授权.excalidraw
      sha256: ae2888891053180f5968551dab4e701646bbb9c35cfd8de092356374ad12750a
updated_by: ai
updated: 2026-11-28
---

图一旦变成服务，就要回答三个安全问题：**谁在调用？他能做什么？他能看到谁的数据？** 最后再补一个能力问题：怎么把外部工具接进来。这四件事分别对应身份认证、授权、资源隔离和 MCP 工具注入。

## 1. 身份认证：谁在调用

![](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/obsidian/1795850334531_身份认证.svg)

客户端在请求头里带一个 Bearer 令牌，服务端据此识别用户。所有操作都要带上它：

```python
from langgraph_sdk import get_client

client = get_client(url="http://127.0.0.1:2024")

# 创建线程时带令牌
thread = await client.threads.create(
    metadata={"__name__": "身份认证测试"},
    headers={"authorization": "Bearer user_1"},
)
thread_id = thread["thread_id"]

# 运行、查询同样要带
await client.runs.wait(
    thread_id=thread_id,
    assistant_id=assistant_id,
    input={"messages": [{"role": "user", "content": "分析最近的黄金走势"}]},
    headers={"authorization": "Bearer user_1"},
)

await client.runs.list(
    thread_id="01a0757b-50c6-7fd3-981b-76e0ce874f0f",
    headers={"authorization": "Bearer user_1"},
)
```

容易漏的是 `runs.list` 这类查询也要带令牌——只给"创建"和"运行"加认证，历史查询就成了缺口。线程和 Run 的接口细节见 [[【实战】Thread API]]。

## 2. 授权：他能做什么

![](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/obsidian/1795850334538_授权.svg)

认证解决"你是谁"，授权解决"你能干什么"。Agent Server 的鉴权功能决定不同用户可以执行哪些操作。比如创建 Assistant 时带管理员令牌，并用 `config` 限制图的运行深度：

```python
await client.assistants.create(
    graph_id="main_agent",
    name="主代理",
    description="最多允许运行100个超步",
    config={"recursion_limit": 100},
    headers={"Authorization": "Bearer admin"},
)
```

`recursion_limit` 是超步数上限：图每跑一个超步算一次，超过 100 就停。这既是防死循环的护栏，也限制了单次运行的成本——和 [[【基础】中间件机制与预置中间件]] 里 `ModelCallLimitMiddleware` 的思路一致，只是一个在图层面、一个在中间件层面。

## 3. 资源隔离：他能看到谁的数据

认证通过不等于能看所有人的数据。隔离分两种做法。

### 3.1 普通资源隔离：隔离键

思路两步：

1. 资源创建时标记一个隔离键，通常是用户 ID。
2. 后续所有操作都按这个隔离键筛选。

```python
user1 = get_client(
    url="http://127.0.0.1:2024",
    headers={"Authorization": "Bearer user_1"},
)
user2 = get_client(
    url="http://127.0.0.1:2024",
    headers={"Authorization": "Bearer user_2"},
)

# user1 创建线程
thread = await user1.threads.create(metadata={"__name__": "用户1的线程3"})

# user2 搜索：看不到 user1 的线程
await user2.threads.search()
```

关键是"创建时打标、查询时筛选"这对动作要成对出现，只做一半等于没隔离。

### 3.2 Store 隔离：命名空间

Store 不能靠隔离键处理，要用命名空间：

- 用户自由存储的资源，必须以正确的用户 ID 作为命名空间前缀。
- 图代码、后端代码等共享资源，自行用命名空间前缀隔离。

```python
await user1.store.put_item(
    ["user_id_001", "store-demo"],
    key="preference",
    value={"theme": "dark", "lang": "zh-cn"},
)

await user1.store.search_items(["user_id_001", "store-demo"])
```

`["user_id_001", "store-demo"]` 这个列表就是命名空间，第一层是用户 ID，第二层是业务分类。换个用户换个第一层前缀，数据自然就隔开了。Store 的结构见 [[【基础】Store 与长期记忆]]。

## 4. MCP 工具注入

最后是怎么把外部工具接进来。用 `langchain-mcp-adapters` 的 `MultiServerMCPClient`：

```bash
uv add langchain-mcp-adapters
```

```python
from langchain_mcp_adapters.client import MultiServerMCPClient

client = MultiServerMCPClient(
    connections={
        "langchain_mcp": {
            "transport": "streamable_http",
            "url": "https://docs.langchain.com/mcp",
        }
    },
    tool_name_prefix=True,
)
tools = await client.get_tools()
```

三个点：

- `connections` 可以配多个 MCP 服务器，每个给一个名字。
- `transport` 这里用 `streamable_http`，也可以接 stdio 等方式，协议背景见 [[【基础】MCP 协议]]。
- `tool_name_prefix=True` 给工具名加上服务器名前缀。多个服务器很可能都有名为 `search` 的工具，加前缀才不会撞名。

拿到的 `tools` 直接传给 `create_agent` 即可，和本地 `@tool` 定义的工具用起来一样。更完整的接入方式见 [[【实战】Agent 接入 MCP]]。
