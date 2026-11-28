---
author: ai
ai_editable: true
summary: 'PIIMiddleware 用确定性规则找到个人身份信息并按 redact/mask/hash/block 处理；讲清内置类型、三个拦截位置与自定义 detector。'
refs:
  pages:
    - 【基础】中间件机制与预置中间件
    - 【概念】上下文工程
  raw:
    - path: raw/langchain-python/08. PII.ipynb
      sha256: e6044c79788dc35d182964c7eb99712bd36ba9821940b72fdebc2c8c18b25a3b
updated_by: ai
updated: 2026-11-28
---

PII 是 **Personally Identifiable Information**（个人身份信息）的缩写，指能直接或间接定位到某个人的信息：姓名、身份证号、手机号、邮箱、住址、银行卡号、IP、设备地址等都算。

把 Agent 接到真实用户数据上时，这些信息会在提示词和工具返回里来来回回。`PIIMiddleware` 的作用就是当一道**出境安检**：发现敏感信息就按规则处理掉，再让消息继续往下走。它属于 [[【基础】中间件机制与预置中间件]] 里的预置中间件，用的是确定性检测规则，不靠模型"自觉"。

## 1. 内置检查类型

| 类型          | 检测内容                 |
| ------------- | ------------------------ |
| `email`       | 邮箱地址                 |
| `credit_card` | 通过 Luhn 校验的信用卡号 |
| `ip`          | IPv4 地址                |
| `mac_address` | MAC 地址                 |
| `url`         | URL                      |

`credit_card` 不是看到 16 位数字就拦，而是要通过 Luhn 校验（一种简单的校验位算法），能显著减少误判。

## 2. 四种处理策略

| 策略     | 作用                 | 示例                  |
| -------- | -------------------- | --------------------- |
| `redact` | 用占位符整个替换     | `[REDACTED_EMAIL]`    |
| `mask`   | 隐藏一部分，只留末尾 | `**** **** **** 1111` |
| `hash`   | 换成稳定哈希值       | `<ip_hash:805ebf20>`  |
| `block`  | 抛异常并终止整次运行 | `PIIDetectionError`   |

"稳定哈希"的意思是同一个 IP 每次都得到同一个哈希值：既不暴露原文，又能让程序判断"这两次是不是同一个 IP"。`block` 最严格——不是脱敏后继续，而是直接让这次 Run 失败。

## 3. 拦截位置

`PIIMiddleware` 使用的是**节点钩子**，不是 `wrap_model_call` 或 `wrap_tool_call`：

```text
  ...
   ↓
before_model  ← 检查点
   ↓
model
   ↓
after_model   ← 检查点
   ↓
  ...
```

这里有个容易踩的坑：`before_model` 和 `after_model` 在一次 Run 里**可能执行多次**（Agent 会反复调模型）。所以"输出检查"针对的是每一次模型调用产生的 `AIMessage`，而不只是 Run 最后那一句答案。

| 参数                    | 默认值  | 检查对象                 | 执行位置                          |
| ----------------------- | ------- | ------------------------ | --------------------------------- |
| `apply_to_input`        | `True`  | 最近一条 `HumanMessage`  | `before_model`                    |
| `apply_to_output`       | `False` | 最近一条 `AIMessage`     | `after_model`                     |
| `apply_to_tool_results` | `False` | 工具产生的 `ToolMessage` | 下一次调用模型前的 `before_model` |

检测到 PII 后，中间件会生成处理后的新消息，返回 `{'messages': new_messages}` 更新图状态。也就是说它改的不只是临时请求，**最终图状态里的对应消息也真的变了**。这符合 [[【概念】上下文工程]] 说的"治理内容安全可信"。唯一例外是 `block`：它抛异常终止 Run，不会把脱敏消息写进状态。

## 4. 常见配置组合

拦截模型输入——一次配齐多种类型：

```python
middleware=[
    PIIMiddleware("email", strategy="redact"),
    PIIMiddleware("credit_card", strategy="mask"),
    PIIMiddleware("ip", strategy="hash"),
    PIIMiddleware("mac_address", strategy="redact"),
    PIIMiddleware("url", strategy="redact"),
]
```

阻止包含 PII 的请求——`block` 不会继续调用模型，而是让 Run 失败：

```python
middleware=[
    PIIMiddleware("email", strategy="block"),
]
```

只检查模型输出：

```python
middleware=[
    PIIMiddleware(
        "email",
        strategy="redact",
        apply_to_input=False,
        apply_to_output=True,
    ),
]
```

只检查工具结果：

```python
middleware=[
    PIIMiddleware(
        "email",
        strategy="redact",
        apply_to_input=False,
        apply_to_output=False,
        apply_to_tool_results=True,
    ),
]
```

## 5. 自定义检测

内置类型盖不住业务数据。比如系统把学号也当作 PII，可以用正则提供 `detector`：

```python
middleware=[
    PIIMiddleware(
        "student_id",
        detector=r"STU-\d{6}",
        strategy="redact",
    ),
]
```

`student_id` 是自定义类型名，替换后的占位符就是 `[REDACTED_STUDENT_ID]`。

正则复杂到写不出来时，还可以给一个检测函数。它接收待检查的字符串，返回每处匹配的内容和起止位置：

```python
def detect_phone_number(content: str):
    matches = []
    for match in re.finditer(r"(?<!\d)1[3-9]\d{9}(?!\d)", content):
        matches.append(
            {
                "value": match.group(),
                "start": match.start(),
                "end": match.end(),
            }
        )
    return matches


middleware=[
    PIIMiddleware(
        "phone_number",
        detector=detect_phone_number,
        strategy="mask",
    ),
]
```

那个 `(?<!\d)` 和 `(?!\d)` 的意思是"前面不能是数字、后面也不能是数字"，避免把一个 11 位手机号里的一段误当成完整号码。
