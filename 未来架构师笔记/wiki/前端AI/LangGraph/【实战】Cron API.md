---
author: ai
ai_editable: true
summary: 'Cron 让 Agent 按计划自动运行。本文区分无状态与绑定线程两种定时任务，给出 cron 表达式速查、创建参数和管理接口。'
refs:
  pages:
    - 【实战】Run API
    - 【实战】Thread API
  raw:
    - path: raw/langgraph-python/21. Cron API.ipynb
      sha256: 8216a7c7807163e1225ddb26c9ac4a6add3710f63fda4b5bb913c64cd1ce7819
updated_by: ai
updated: 2026-10-31
---

定时任务在 Agent 场景很常见：每天早报、每周汇总、定时巡检。Cron API 用标准的 cron 表达式描述时间计划，到点就自动创建一个 Run。

```python
from langgraph_sdk import get_client

client = get_client(url="http://localhost:2024")
```

## 1. 两种 Cron

| 类型        | 特点                                     | 创建方式                              |
| ----------- | ---------------------------------------- | ------------------------------------- |
| 无状态 Cron | 每次执行新建线程，结束按策略清理         | `client.crons.create(...)`            |
| 线程 Cron   | 绑定固定线程，每次执行复用，能积累上下文 | `client.crons.create_for_thread(...)` |

无状态适合"每次独立采集"；线程 Cron 适合"每天在同一个会话里追加一条晨报"。

## 2. cron 表达式速查

5 个字段，依次为：分、时、日、月、星期。

| 位置 | 字段 | 取值范围        |
| ---- | ---- | --------------- |
| 1    | 分钟 | 0-59            |
| 2    | 小时 | 0-23            |
| 3    | 日   | 1-31            |
| 4    | 月   | 1-12            |
| 5    | 星期 | 0-6（0 为周日） |

| 表达式        | 含义        |
| ------------- | ----------- |
| `0 9 * * *`   | 每天 9:00   |
| `*/5 * * * *` | 每 5 分钟   |
| `*/2 * * * *` | 每 2 分钟   |
| `0 0 * * 1`   | 每周一 0:00 |

不传 `timezone` 时按 **UTC** 解释，国内使用务必显式指定时区。

## 3. 创建 Cron

```python
cron = await client.crons.create(
    assistant_id=assistant_id,
    schedule="*/2 * * * *",
    input={"messages": [{"role": "user", "content": "汇报当前时间"}]},
    metadata={"lesson": "无状态 Cron"},
    enabled=False,
)

thread_cron = await client.crons.create_for_thread(
    thread_id=thread_id,
    assistant_id=assistant_id,
    schedule="0 9 * * *",
    input={"messages": [{"role": "user", "content": "每日晨报"}]},
    enabled=False,
)
```

`enabled=False` 先创建不启用，确认配置无误后再打开，避免调试时频繁触发。

无状态 Cron 的线程去留由 `on_run_completed` 控制：

- `delete`（默认）：运行结束即删线程；
- `keep`：保留线程，数据会持续累积，需要自己清理。

### 3.1 cron 对象字段

| 字段            | 含义                         |
| --------------- | ---------------------------- |
| `cron_id`       | 任务 ID                      |
| `thread_id`     | 绑定的线程（无状态通常为空） |
| `assistant_id`  | 执行时使用的助手             |
| `schedule`      | cron 表达式                  |
| `payload`       | 每次执行时创建运行的参数     |
| `next_run_date` | 下次执行时间                 |
| `end_time`      | 结束时间，空表示长期运行     |
| `enabled`       | 是否启用                     |

## 4. 管理

| 操作             | SDK / HTTP                                                     |
| ---------------- | -------------------------------------------------------------- |
| 搜索             | `client.crons.search(...)` / `POST /runs/crons/search`         |
| 按 ID 获取       | `client.http.get(f"/runs/crons/{cron_id}")`（SDK 尚未封装）    |
| 统计             | `client.crons.count()` / `POST /runs/crons/count`              |
| 启用/禁用/改计划 | `client.crons.update(cron_id, ...)` / `PATCH /runs/crons/{id}` |
| 删除             | `client.crons.delete(cron_id)` / `DELETE /runs/crons/{id}`     |

```python
crons = await client.crons.search(metadata={"lesson": "无状态 Cron"})

cron = await client.crons.update(cron_id=cron["cron_id"], enabled=True)
cron = await client.crons.update(cron_id=cron["cron_id"], schedule="30 8 * * *")

for c in await client.crons.search():
    await client.crons.delete(c["cron_id"])
```

注意：`langgraph-sdk` 的 `client.crons` 目前没有封装"按 ID 获取单个"和"按 ID 获取详情"，需要退回 `client.http.get` 直接请求 HTTP 接口。

定时任务每次执行本质上就是一次 Run，运行记录的查看方式见 [[【实战】Run API]]。
