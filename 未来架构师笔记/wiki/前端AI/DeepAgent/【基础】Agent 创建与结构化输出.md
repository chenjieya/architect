---
author: ai
ai_editable: true
summary: '用 create_agent 一行创建 Agent，并让模型按固定 JSON 格式回答：讲清参数表、结构化输出的场景、三条实现路线与 Provider/Tool 策略选型。'
refs:
  pages:
    - 【导言】DeepAgent 生态与学习地图
    - 【基础】工具与工具节点
    - 【实战】Tool Calling
  raw:
    - path: raw/langchain-python/02. 认识 Agent.md
      sha256: 2e4e0ebcbf7ad2fa9dd8366c54f36ca86dff3358328315d7131b7b5e3f4c3ab2
    - path: raw/langchain-python/03. 结构化输出.md
      sha256: 74ddfba2a98b8e037b7c78f3236ba07aa26c4bf7a49e1c3faf7d3f6a8a3bcf69
updated_by: ai
updated: 2026-11-28
---

`create_agent` 是进入这个生态的第一行代码。它把一个模型、一组工具、一套提示词"编译"成一张可以运行的图。理解它的参数，就等于先看清了整辆车的仪表盘。

## 1. 创建 Agent

最少只需要告诉它用哪个模型：

```python
agent = create_agent(
    model="anthropic:qwen3.7-plus",  # 必填：供应商:模型名
)
```

这里的写法是 `Provider:Model Name`，冒号前面是模型服务商，冒号后面是具体型号。换个服务商，只改这个字符串，后面的业务代码不用动——这就是 [[【导言】DeepAgent 生态与学习地图]] 里说的"统一模型外观"。

## 2. 选填参数

| 参数名           | 含义                                         | 默认值                   |
| ---------------- | -------------------------------------------- | ------------------------ |
| `tools`          | 工具列表                                     | 无工具                   |
| `system_prompt`  | 系统提示词                                   | 无系统提示词             |
| `state_schema`   | 图状态的数据结构                             | 只有一个 `messages` 字段 |
| `context_schema` | context 的结构                               | 无                       |
| `checkpointer`   | 检查点存储方案，使用 Agent Server 时无须传递 | 无检查点                 |
| `store`          | store 存储方案，使用 Agent Server 时无须传递 | 无 store                 |

用大白话拆一下容易困惑的三个：

- **`state_schema`**：图在运行时随身携带的"书包"。默认只装 `messages`（对话消息），需要记住别的字段时就自己定义。
- **`checkpointer`**：把书包每隔一段时间拍张照片存起来，服务重启后能接着聊。交给 Agent Server 托管时不用自己配。
- **`store`**：跨线程的长期记忆，相当于把东西存进仓库而不是随身书包，详见 [[【基础】Store 与长期记忆]]。

## 3. 结构化输出是什么

默认情况下，模型回一大段自由文本。但程序要的是能直接读的字段。结构化输出就是让 Agent **始终按一张固定的表格填空**：

```json
{
  "name": "张三",
  "phone": "13300001111",
  "address": "四川省成都市xxxx"
}
```

把模型想象成一个很会说话但不会填表的实习生：以前他说一段话你得自己听重点，现在给他一张带字段名的表，他只能往格子里写，程序拿过来就能直接用。

## 4. 常见场景

| 场景           | 输出示例                                                                               |
| -------------- | -------------------------------------------------------------------------------------- |
| 信息抽取       | `{"name": "张三", "phone": "13300001111", "address": "四川省成都市xxxx"}`              |
| 分类或打标签   | `{"category": "退款", "urgency": "高"}`                                                |
| 情感分析       | `{"sentiment": "负面", "score": 0.92, "reason": "用户对等待时间不满"}`                 |
| 生成数据库记录 | `{"customer_name": "李明", "phone": "138...", "appointment_time": "2026-08-21 14:00"}` |

共同点都是：**字段固定、类型固定、程序要直接消费**。

## 5. 三条实现路线

1. **工具调用**：强制模型调用一个参数就是目标格式的工具。思路和 [[【实战】Tool Calling]] 一致。
2. **模型服务商**：让服务商在接口层直接保证输出符合 `json_schema`，模型只能按 schema 生成。
3. **自动抉择**：LangChain 自己判断用哪一种。

## 6. 怎么选：ProviderStrategy 还是 ToolStrategy

决策只问一个问题——**这个 Agent 带工具吗？**

**不带工具**：用 `ProviderStrategy`。

- 前提是你仔细选了模型服务商：它必须支持 `json_schema`。
- 这时格式约束由服务端保证，最省事，也最不容易出错。

**带工具**：用 `ToolStrategy`。

- 因为工具调用本身已经占用了模型的"按格式输出"通道，再让服务商做一层结构化会打架；用工具路径承载结构化输出更稳。

一句话：**没工具走服务端格式（Provider），有工具走工具格式（Tool）**。
