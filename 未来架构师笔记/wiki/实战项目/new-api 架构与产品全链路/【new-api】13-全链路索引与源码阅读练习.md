---
author: ai
ai_editable: true
summary: '以功能族列出入口、跨层路径、状态变化与异常分支，并提供从 JS/Python 出发的源码阅读练习。'
refs:
  pages:
    - '【new-api】00-总览与阅读地图'
    - '【new-api】01-产品全景与用户旅程'
    - '【new-api】03-账号登录与三种凭据'
    - '【new-api】04-渠道模型分组与故障重试'
    - '【new-api】05-一次AI调用的完整生命周期'
    - '【new-api】06-多模态与协议分支'
    - '【new-api】07-计费预扣结算与退款'
    - '【new-api】08-计费数学与完整算例'
    - '【new-api】09-充值订阅与运营闭环'
    - '【new-api】10-异步任务与JavaScript插件'
    - '【new-api】11-React前端到Go后端'
    - '【new-api】12-数据存储启动部署与运维'
    - '【new-api】14-离线参考入口与完整性审计'
    - '【new-api】20-ModelDock实现交接与验收清单'
    - '【new-api】21-离线证据与附件索引'
  raw: []
updated_by: ai
updated: 2026-11-03
tags:
  - new-api
  - 架构导读
  - 产品链路
source_commit: 9b473a3fe4fed8d18980fd8d3c6a8908847a5f25
---

## 1. 【new-api】13-全链路索引与源码阅读练习

> 文档遵循 md-output 规范；标题层级与编号以知识库规则和格式化脚本为准。离线资料的使用方法见 [[【new-api】14-离线参考入口与完整性审计]]。
> 源码快照：`9b473a3fe4fed8d18980fd8d3c6a8908847a5f25`。仅做静态代码导读，未执行线上业务验证。

专题入口：[[【new-api】00-总览与阅读地图]]

> **跨电脑参考补充：** [[【new-api】14-离线参考入口与完整性审计]]、[[【new-api】20-ModelDock实现交接与验收清单]]、[[【new-api】21-离线证据与附件索引]]。ModelDock 已确定另建 Python 后端；参考事实与新设计建议分开记录。

[TOC]

---

### 1.1 修订记录

| 编号 | 版本 |  修订人  | 修订内容                           | 日期       |
| :--: | :--- | :------: | :--------------------------------- | :--------- |
| 001  | 1.0  | jie.chen | 基于源码创建架构与产品链路导读     | 2026-11-03 |
| 002  | 1.1  | jie.chen | 补充离线入口并移除本机源码链接依赖 | 2026-11-03 |

---

### 1.2 怎么使用这份链路索引

前面各页解释原理；这页用于查漏和定位。下面覆盖当前路由里的主要产品功能族：管理动作按同一业务族归并，厂商细节以 Go 适配器或 JS 插件为扩展点展开。它不是声称已经逐个实测所有端点。

“入口”列中的路径前缀用于查找一组接口，不表示该前缀自身支持所有 HTTP 方法。要确认具体方法、权限与参数，请打开表末来源中的路由文件。

---

### 1.3 产品管理链路全集索引

| 功能族                 | 代表入口                                             | 主路径与持久变化                          | 关键失败分支                 | 详解                                                                               |
| :--------------------- | :--------------------------------------------------- | :---------------------------------------- | :--------------------------- | :--------------------------------------------------------------------------------- |
| 首次初始化             | `/api/setup`                                         | Setup 控制器 → 初始化状态与管理员         | 已初始化、输入不合规         | [[【new-api】01-产品全景与用户旅程]]、[[【new-api】12-数据存储启动部署与运维]]     |
| 门户状态与内容         | `/api/status`、`/notice`、`/about`、协议页面         | 查询站点配置 → 前端展示                   | 访问策略、内容未配置         | [[【new-api】01-产品全景与用户旅程]]、[[【new-api】11-React前端到Go后端]]          |
| 注册与邮件验证         | `/api/user/register`、`/api/verification`            | 验证 → 用户创建                           | 注册关闭、验证失败、重复账号 | [[【new-api】03-账号登录与三种凭据]]                                               |
| 密码登录与附加验证     | `/api/user/login`、`/login/verify`、`/login/2fa`     | 身份确认 → 会话与令牌                     | 认证失败、附加验证未完成     | [[【new-api】03-账号登录与三种凭据]]                                               |
| 第三方登录与绑定       | `/api/oauth/*`                                       | state / 回调 → 用户或绑定关系             | 状态无效、绑定冲突           | [[【new-api】03-账号登录与三种凭据]]                                               |
| 密码恢复               | `/api/reset_password`、`/api/user/reset`             | 邮件凭据 → 密码更新                       | 凭据无效、过期               | [[【new-api】03-账号登录与三种凭据]]                                               |
| Passkey                | `/api/user/passkey/*` 等                             | challenge → 凭据或验证结果                | challenge / 验证不通过       | [[【new-api】03-账号登录与三种凭据]]                                               |
| MFA 和恢复码           | `/api/user/2fa/*`                                    | setup / enable / disable → 账号验证状态   | 未通过必要安全验证           | [[【new-api】03-账号登录与三种凭据]]                                               |
| 会话刷新与注销         | `/api/user/auth/*`、`/api/user/sessions`             | 认证服务 → 会话刷新或撤销                 | 会话失效、刷新不同步         | [[【new-api】03-账号登录与三种凭据]]                                               |
| 敏感操作验证           | `/api/verify/methods`、`/api/verify`                 | 校验身份 → 取得安全证明 → 后续动作        | 证明不满足条件               | [[【new-api】03-账号登录与三种凭据]]                                               |
| 个人资料与设置         | `/api/user/self`、`/api/user/setting`                | 当前用户上下文 → 用户字段与偏好           | 输入或权限不允许             | [[【new-api】11-React前端到Go后端]]                                                |
| 个人管理访问令牌       | `/api/user/access_tokens`                            | scope 校验 → PAT 管理与审计               | scope、过期或路由范围不符    | [[【new-api】03-账号登录与三种凭据]]                                               |
| AI API Key 管理        | `/api/token/*`                                       | 用户鉴权 → Token 创建、限制、删除、取 Key | 操作不属于当前用户、输入错误 | [[【new-api】03-账号登录与三种凭据]]、[[【new-api】11-React前端到Go后端]]          |
| 钱包充值               | `/api/user/pay` 及平台 pay 路径                      | 下单 → 回调 → TopUp 与用户 quota          | 下单、回调、订单状态异常     | [[【new-api】09-充值订阅与运营闭环]]                                               |
| 支付回调               | `/api/stripe/webhook` 等                             | 平台消息验证 → 订单状态转换 → 入账        | 重复 / 不匹配 / 不可信消息   | [[【new-api】09-充值订阅与运营闭环]]                                               |
| 订阅购买和偏好         | `/api/subscription/*`                                | 方案 → 订单 / 余额购买 → 用户订阅         | 方案不可用、资金或支付失败   | [[【new-api】09-充值订阅与运营闭环]]、[[【new-api】07-计费预扣结算与退款]]         |
| 订阅管理               | `/api/subscription/admin/*`                          | 管理员绑定、重置、失效、删除              | 权限或权益状态不符           | [[【new-api】09-充值订阅与运营闭环]]                                               |
| 兑换码管理与兑换       | `/api/redemption/*`、`/api/user/topup`               | 创建兑换码 → 校验领取 → quota 入账        | 失效、已使用                 | [[【new-api】09-充值订阅与运营闭环]]                                               |
| 签到与邀请             | `/api/user/checkin`、`/aff`、`/aff_transfer`         | 运营资格 → 奖励或额度转移                 | 重复、未启用、余额条件       | [[【new-api】09-充值订阅与运营闭环]]                                               |
| 用户运营管理           | `/api/user/` 的管理员路由                            | 创建 / 修改 / 管理 / 删除用户             | 权限及目标状态               | [[【new-api】01-产品全景与用户旅程]]                                               |
| 渠道生命周期           | `/api/channel/*`                                     | 校验 → Channel → Ability → 缓存           | 上游配置、插件绑定、权限错误 | [[【new-api】04-渠道模型分组与故障重试]]                                           |
| 渠道测试与模型更新     | 渠道管理接口与周期系统任务                           | 发起测试 / 拉模型 → 更新状态与结果        | 上游不可达、凭据或模型错误   | [[【new-api】04-渠道模型分组与故障重试]]、[[【new-api】12-数据存储启动部署与运维]] |
| 分组与预填模板         | `/api/group`、`/api/prefill_group`                   | 查询或维护配置模板                        | 权限、输入错误               | [[【new-api】04-渠道模型分组与故障重试]]                                           |
| 模型与厂商元数据       | `/api/models/*`、`/api/vendors/*`                    | 增删改查 / 同步 → 模型目录信息            | 输入或同步失败               | [[【new-api】01-产品全景与用户旅程]]、[[【new-api】04-渠道模型分组与故障重试]]     |
| 价格、预览与同步       | `/api/option/model_pricing*`、`/api/ratio_sync/*`    | 价格草稿 → 预览 / 冲突检查 → 持久化       | 表达式无效、配置版本冲突     | [[【new-api】07-计费预扣结算与退款]]、[[【new-api】08-计费数学与完整算例]]         |
| 模型目录与性能展示     | `/api/pricing`、`/api/rankings`、`/api/perf-metrics` | 配置和聚合数据 → 用户选型界面             | 访问限制、数据缺失           | [[【new-api】01-产品全景与用户旅程]]、[[【new-api】12-数据存储启动部署与运维]]     |
| 管理授权               | `router/authz-router.go`                             | 用户 / 角色 / 权限关系 → Casbin 策略      | 权限不足、策略不允许         | [[【new-api】03-账号登录与三种凭据]]                                               |
| 全局配置与自定义 OAuth | `/api/option/*`、`/api/custom-oauth-provider/*`      | Root 校验 → 配置持久化 → 运行态同步       | 配置无效、同步差异           | [[【new-api】12-数据存储启动部署与运维]]                                           |
| 插件管理               | `/api/plugin/task/*`                                 | 上传 / 校验 / 启用 / 版本切换 → 路由代    | 编译、元数据或路由冲突       | [[【new-api】10-异步任务与JavaScript插件]]                                         |
| 消费日志与导出         | `/api/log/*`                                         | 按角色过滤记录 → 搜索、统计、导出         | 无记录、无权查看             | [[【new-api】12-数据存储启动部署与运维]]                                           |
| 审计日志               | `/api/audit`、`/api/audit/self`                      | 操作记录 → 权限过滤与查询                 | 审计查看权限不足             | [[【new-api】12-数据存储启动部署与运维]]                                           |
| 用户任务历史           | `/api/task`、`/api/task/self`、`/api/mj/*`           | 按归属查询任务和产物                      | 非所属任务、结果不可取       | [[【new-api】10-异步任务与JavaScript插件]]                                         |
| 看板与数据趋势         | `/api/data/*`                                        | 聚合缓存 / 持久数据 → 图表                | 聚合滞后、筛选不同           | [[【new-api】12-数据存储启动部署与运维]]                                           |
| 系统任务与日志清理     | `/api/system-task/*`                                 | 建任务 → 租约领取 → 执行历史              | 执行失败、租约丢失           | [[【new-api】12-数据存储启动部署与运维]]                                           |
| 实例与运行维护         | `/api/system-info/*`、`/api/performance/*`           | 节点上报 / 缓存与日志维护                 | 实例离线、权限不足           | [[【new-api】12-数据存储启动部署与运维]]                                           |
| 外部模型部署           | `/api/deployments/*`                                 | 管理接口 → 外部 io.net 相关服务           | 外部连接、部署状态或输入问题 | [[【new-api】01-产品全景与用户旅程]]                                               |

外围功能在本表按控制器职责概括；详细验证规则应进入具体控制器，而不从表格推断全部行为。

---

### 1.4 AI 运行链路全集索引

| 链路                | 入口                                      | 共用主干                            | 独立分支                        | 详解                                                                           |
| :------------------ | :---------------------------------------- | :---------------------------------- | :------------------------------ | :----------------------------------------------------------------------------- |
| 可用模型查询        | `/v1/models`、`/v1beta/models`            | TokenAuth → 模型列表                | 按客户端协议返回不同结构        | [[【new-api】04-渠道模型分组与故障重试]]、[[【new-api】06-多模态与协议分支]]   |
| 文本普通与 SSE      | `/v1/chat/completions` 等                 | 认证 → 选渠道 → 预留 → relay → 结算 | JSON / SSE、协议转换与透传配置  | [[【new-api】05-一次AI调用的完整生命周期]]                                     |
| Claude / Gemini     | `/v1/messages`、`/v1beta/models/*path`    | 相似 relay 主干                     | 原生协议与错误格式              | [[【new-api】06-多模态与协议分支]]                                             |
| Responses 与压缩    | `/v1/responses`、`/responses/compact`     | 普通 relay 或共享协议分发           | 插件 sync / stream / background | [[【new-api】06-多模态与协议分支]]、[[【new-api】10-异步任务与JavaScript插件]] |
| WebSocket           | `/v1/realtime`、GET `/v1/responses`       | 认证、事件处理、选渠道              | 持续连接、事件限流、专用收尾    | [[【new-api】06-多模态与协议分支]]                                             |
| 图片                | `/v1/images/generations`、`/images/edits` | 普通图片或插件执行                  | multipart、数量修正、即时完成   | [[【new-api】06-多模态与协议分支]]                                             |
| 音频                | `/v1/audio/*`                             | 音频 Helper、用量与结算             | 转写 / 翻译 / 合成              | [[【new-api】06-多模态与协议分支]]                                             |
| 向量与重排          | `/v1/embeddings`、`/v1/rerank`            | 认证、分发、适配、结算              | 向量或排序结果                  | [[【new-api】06-多模态与协议分支]]                                             |
| 内容审核与专用工具  | `/v1/moderations`、搜索工具路径           | relay 中相应模式                    | 能力取决于渠道与处理器          | [[【new-api】06-多模态与协议分支]]                                             |
| 在线试验台          | `/pg/chat/completions`                    | 会话身份 → 试验台上下文 → Relay     | 不要求使用持久化 API Key        | [[【new-api】11-React前端到Go后端]]                                            |
| 视频与通用任务      | `/v1/videos`、`/v1/tasks/:key`            | 预留 → 提交 → Task 持久化           | 后台轮询、终态结算              | [[【new-api】10-异步任务与JavaScript插件]]                                     |
| 插件原生协议        | 插件 meta.routes 的路径                   | 宿主认证与任务治理                  | 厂商解码与呈现                  | [[【new-api】10-异步任务与JavaScript插件]]                                     |
| 任务查询与文件      | 任务检索、artifacts、视频 content         | 归属检查 → Task / 产物              | 代理、签名访问、丢弃结果等      | [[【new-api】10-异步任务与JavaScript插件]]                                     |
| Midjourney 专用任务 | `/mj/*`、`/:mode/mj/*`                    | 专用 relay 与任务处理               | imagine、action、fetch 等       | [[【new-api】06-多模态与协议分支]]、[[【new-api】10-异步任务与JavaScript插件]] |
| 旧客户端用量兼容    | `/dashboard/*`                            | 专门的 dashboard 路由               | 兼容查询，不是 React 页面路由   | [[【new-api】03-账号登录与三种凭据]]、[[【new-api】12-数据存储启动部署与运维]] |

明确未实现的兼容端点见 [[【new-api】06-多模态与协议分支]]。厂商清单可以继续从 `relay/channel/` 与 `plugins/tasks/` 展开；新增厂商通常接入这里已有的生命周期，而不是重新发明一套用户与钱包。

---

### 1.5 用六次阅读建立源码直觉

#### 1.5.1 第一次：只看入口

读 `main.go` → `router/main.go` → `router/relay-router.go`。回答：哪些是管理接口？哪些是模型调用？为什么 `/pg` 与 `/v1` 用的认证不同？

#### 1.5.2 第二次：跟一条文本请求

读 `controller/relay.go` 的 `Relay` → `relay/compatible_handler.go` 的 `TextHelper`。把每个主要调用用一句中文标为“检查、选择、预留、转换、发送、结算”之一。

#### 1.5.3 第三次：看一次前端操作

从 `web/src/features/keys/api.ts` 找创建 Key 的 URL，跨到 `router/api-router.go` 和 `controller/token.go`。回答：创建 Key 用的凭据，和创建出来的 Key 有什么区别？

#### 1.5.4 第四次：算清一笔账

先读 [[【new-api】08-计费数学与完整算例]]，再看 `service/billing.go` 与 `BillingSession.Settle`。回答：预扣比实际多时，代码为什么只处理差额？令牌额度与钱包为何都变化？

#### 1.5.5 第五次：从 JS 插件看长任务

先读 Task Plugin API v1，再选择 `plugins/tasks/` 中一个 plugin.js，寻找 meta、buildSubmitRequest、parseSubmitResponse 与查询钩子。对照 [[【new-api】10-异步任务与JavaScript插件]] 区分“插件描述请求”和“宿主真的发请求”。

#### 1.5.6 第六次：解释故障

假设视频已提交，但网页关了；或者文本已输出一半，但上游断了。用任务行、流状态、计费快照、系统轮询解释后续，而不是笼统说“请求失败所以回滚”。

---

### 1.6 检查你是否真正建立整体认识

| 问题                                     | 应能说出的要点                                   |
| :--------------------------------------- | :----------------------------------------------- |
| 用户发来的 Key 会原样交给上游吗？        | 网关 Key 用于本地身份，上游请求通常使用渠道凭据  |
| 一个模型能有多个供应来源吗？             | 可以，通过模型、分组、渠道能力、优先级与权重选择 |
| 有模型介绍就能调用吗？                   | 还需合格渠道、权限和定价等条件                   |
| `model/` 是存放大模型的地方吗？          | 是数据库业务对象及操作代码                       |
| API Key 不限额，是否不会欠额度？         | Key 限额与钱包 / 订阅资金是不同约束              |
| 视频提交成功，是否生成成功？             | 只代表任务已被接纳，终态由即时结果或轮询推进     |
| JS 插件直接操作用户余额吗？              | 报告协议与用量，扣费和任务治理由 Go 宿主完成     |
| 用户关闭页面是否必然退款？               | 否，要看上游工作、输出、任务持久化与结算状态     |
| React 页面是后端权限边界吗？             | 服务端必须再鉴权与授权                           |
| 一个 Go 进程能否同时处理请求和后台任务？ | 可以，goroutine 等并发机制配合数据库和锁协调     |

回到 [[【new-api】00-总览与阅读地图]]，现在应能沿总图讲完“谁来用 → 买到什么 → 如何交付 → 如何记账 → 如何运营”。

---

### 1.7 参考资料

- [[new-api-ref--router--api-router.go.txt]]:17，定位 `func SetApiRouter`。
- [[new-api-ref--router--channel-router.go.txt]]:40，定位 `func registerChannelRoutes`。
- [[new-api-ref--router--authz-router.go.txt]]:13，定位 `func registerAuthzRoutes`。
- [[new-api-ref--router--relay-router.go.txt]]:15，定位 `func SetRelayRouter`。
- [[new-api-ref--router--dashboard.go.txt]]:10，定位 `func SetDashboardRouter`。
- [[new-api-ref--router--task-plugin-protocol-router.go.txt]]:13，定位 `func SetTaskPluginProtocolRouter`。
- [[new-api-ref--router--task-router.go.txt]]:14，定位 `func SetTaskRouter`。
- [[new-api-ref--router--plugin-router.go.txt]]:1，定位 `package router`。
- [[new-api-ref--router--video-router.go.txt]]:10，定位 `func SetVideoRouter`。
