---
author: ai
ai_editable: true
summary: '保存 OpenAPI、路由和前端契约，区分管理 JSON、模型协议、SSE、任务与 WebSocket。'
refs:
  pages:
    - '【new-api】00-总览与阅读地图'
    - '【new-api】14-离线参考入口与完整性审计'
    - '【new-api】03-账号登录与三种凭据'
    - '【new-api】06-多模态与协议分支'
    - '【new-api】11-React前端到Go后端'
  raw: []
updated_by: ai
updated: 2026-11-03
tags: [new-api, ModelDock, 离线参考]
source_commit: 9b473a3fe4fed8d18980fd8d3c6a8908847a5f25
---

## 1. 【new-api】17-接口契约与协议边界

> 文档遵循 md-output 规范；标题层级与编号以知识库规则和格式化脚本为准。事实依据固定为源码快照 `9b473a3fe4fed8d18980fd8d3c6a8908847a5f25`，Python 方案单独标为建议。

[TOC]

---

### 1.1 修订记录

| 编号 | 版本 |  修订人  | 修订内容               | 日期       |
| :--: | :--- | :------: | :--------------------- | :--------- |
| 001  | 1.0  | jie.chen | 补齐跨电脑离线参考资料 | 2026-11-03 |

---

### 1.2 离线接口资料在哪里

| 文件                                     | 内容                                                       | 边界                                                 |
| :--------------------------------------- | :--------------------------------------------------------- | :--------------------------------------------------- |
| [[new-api-openapi-api.json]]             | 原管理 API 文档，136 个 path                               | 不是当前全部路由；schema 只有 8 个，部分响应描述简略 |
| [[new-api-openapi-relay.json]]           | 原模型 API 文档，35 个 path、52 个 schema                  | 厂商兼容性与启用状态须另看具体实现                   |
| [[new-api-openapi-operation-index.json]] | 两份文档中共 199 个 HTTP 操作，含请求与响应定义            | 一个 path 可以有多个方法；不是 199 个产品功能        |
| [[new-api-route-declarations.json]]      | router 下 462 条路由/分组/中间件声明，附原文件和行号       | 没有猜测 Group 拼接和动态插件展开；不是 462 个端点   |
| 源码文本附件                             | router、controller、middleware、DTO、前端 api/types/schema | OpenAPI 缺项时的静态补充证据                         |

不要只读取 OpenAPI 后宣布“后端接口已经全部还原”。例如较新的账号会话、PAT、任务插件与细分管理能力需要结合路由和对应控制器。新项目应让自己的实现产生自己的接口文档与契约测试。

---

### 1.3 三类入口不可混用

| 入口                            | 典型凭据                                   | 返回形态                                               |
| :------------------------------ | :----------------------------------------- | :----------------------------------------------------- |
| `/api/...` 管理面               | 控制台登录态；部分支持带范围的个人访问令牌 | 通常为 success/message/data 封装，错误消息可由前端翻译 |
| `/v1/...`、`/v1beta/...` 模型面 | 用户创建的 AI API Key，另有协议特定头      | 与目标模型协议一致，不能擅自套管理面的 data 外壳       |
| `/pg/chat/completions` 试验台   | 登录用户身份                               | 模型输出/流，资金归属仍要明确                          |

这里的凭据是用途分类，不代表每条 `/api` 都接受 PAT，也不代表所有模型协议只认 Authorization 头。具体路由中间件和认证实现已保存。管理权限必须由后端验证，不能只靠侧栏隐藏按钮。

---

### 1.4 一条具体管理契约：API Key

原前端通过 `features/keys/api.ts` 调用令牌列表、创建、更新、删除、取真实密钥等接口。列表返回 Key 的掩码版本；取原始 Key 使用独立受保护接口。不要把“列表中出现 key 字段”理解为列表必定返回可用密钥。

核心路径见原 `router/api-router.go`：列表 `GET /api/token/`，创建 `POST /api/token/`，更新 `PUT /api/token/`，单条删除 `DELETE /api/token/:id`，读取真实 Key `POST /api/token/:id/key`。这些都是参考项目契约，不是 ModelDock 已经提供的 URL。

下面是按已读取前端类型整理的**结构示例，非抓包结果**：

```json
{
  "success": true,
  "data": {
    "items": [],
    "total": 0,
    "page": 1,
    "page_size": 20
  }
}
```

创建表单字段包括 `name`、`remain_quota`、`expired_time`、`unlimited_quota`、`model_limits_enabled`、`model_limits`、`allow_ips`、`allow_user_quota_query`、`group`、`auto_groups`、`cross_group_retry`。其中 `auto_groups` 在接口层是数组，Token 持久化字段却是字符串；不能直接把 ORM 结构裸露给前端。

`expired_time = -1` 是原系统“永不过期”约定；`allow_user_quota_query` 的未传、显式 false，以及创建和更新的默认处理不相同。这类区别要在新 DTO 中保留“是否提供该字段”的信息，不能使用 `value or default` 吞掉 false/0。

---

### 1.5 文本请求、响应和流

以下为协议形状示例，不是对任何厂商真实请求的承诺：

```json
{
  "model": "demo-chat",
  "messages": [{ "role": "user", "content": "你好" }],
  "stream": false,
  "max_tokens": 256
}
```

非流式 Chat Completions 通常返回 `id/object/model/choices/usage` 等协议字段。模型面错误也按对应协议组织，不要把所有异常都转成 HTTP 200 和管理面 `success:false`。

SSE 的关键是 `Content-Type: text/event-stream`、事件边界、逐块转发、结束语义与 Usage 归集。TCP 一次 read 可能只收到半条 JSON，也可能包含多条事件，不能把网络 read 直接当消息。

```text
data: {"id":"chatcmpl-demo","choices":[{"index":0,"delta":{"content":"你好"}}]}

data: [DONE]

```

这个例子只演示 Chat Completions 的 SSE 形态。Claude、Responses 和插件事件有自己的 event/type/结束语义，不能全部拼成 `[DONE]`。Usage 可能在末尾单独出现；客户端断开时不能仅按浏览器收到的字符数结算。

---

### 1.6 多模态与任务的契约检查点

| 类别              | 输入重点                                | 返回和状态重点                                             |
| :---------------- | :-------------------------------------- | :--------------------------------------------------------- |
| 图片              | JSON 或 multipart，n/size/quality，文件 | URL/base64/事件；按有效图像计量而非盲数数组                |
| 音频转写          | 上传文件、格式、模型                    | JSON/文本等分支与音频计量；不把文件完整读进日志            |
| TTS               | 文本、声音、格式                        | 可能直接返回音频二进制，不能包成普通 JSON                  |
| Embeddings/Rerank | 输入批次、维度/候选项                   | 数值数组/排序分数；请求数量也影响限额                      |
| 视频/任务         | 模型参数、任务选项                      | 提交响应、任务 ID、查询、失败、产物获取                    |
| Responses         | input、工具声明、background/stream 等   | 普通转发和任务宿主实现边界不同；不是所有 ID 都可在本地检索 |
| WebSocket         | 握手后事件、连接生命周期                | 双向状态与逐次请求计费，不能当一次普通 POST                |

工具调用声明并不意味着网关会替用户执行所有 function tools；搜索/fetch 等专用接口与对话中的工具调用是不同功能。

---

### 1.7 错误与重试契约

先区分“发给上游之前失败”“上游可能已接受但本地超时”“已经向客户端输出部分内容”“上游成功但本地结算失败”。这四种情况不能共用一个无条件重试和退款分支。HTTP 状态映射、是否禁用渠道、是否重试、是否退款也是四个独立决定。

ModelDock 建议每个受支持入口写出：认证方式、请求 schema、默认/空值语义、成功响应、错误响应、流结束规则、幂等策略、可取消性、用量来源和计费状态。未决定的协议应显式列入“不支持”，不能仅因 SDK 有方法就承诺可用。

---

### 1.8 关联阅读

[[【new-api】00-总览与阅读地图]]、[[【new-api】14-离线参考入口与完整性审计]]、[[【new-api】03-账号登录与三种凭据]]、[[【new-api】06-多模态与协议分支]]、[[【new-api】11-React前端到Go后端]]。
