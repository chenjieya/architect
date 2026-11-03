---
author: ai
ai_editable: true
summary: '按迁移清单保存 38 个实体、490 个字段声明和 11 个嵌套对象，标明索引及不落库字段。'
refs:
  pages:
    - '【new-api】00-总览与阅读地图'
    - '【new-api】14-离线参考入口与完整性审计'
    - '【new-api】15-数据库关系约束与建模说明'
  raw: []
updated_by: ai
updated: 2026-11-03
tags: [new-api, ModelDock, 离线参考]
source_commit: 9b473a3fe4fed8d18980fd8d3c6a8908847a5f25
---

## 1. 【new-api】16-数据库字段字典

> 文档遵循 md-output 规范；标题层级与编号以知识库规则和格式化脚本为准。事实依据固定为源码快照 `9b473a3fe4fed8d18980fd8d3c6a8908847a5f25`，Python 方案单独标为建议。

[TOC]

---

### 1.1 修订记录

| 编号 | 版本 |  修订人  | 修订内容               | 日期       |
| :--: | :--- | :------: | :--------------------- | :--------- |
| 001  | 1.0  | jie.chen | 补齐跨电脑离线参考资料 | 2026-11-03 |

---

### 1.2 阅读规则与提取边界

本页完整列出迁移清单中的 **38 个实体、490 个结构体字段声明**；另外列出任务/审计等 11 个嵌套对象。`gorm:"-"` 或 `gorm:"-:all"` 的字段不落库。`gorm:"->"` 表示只读映射，不能简单当成普通可写字段。未声明标签不等于没有 ORM 默认行为。

这是源码字典，不是从数据库 introspection 得到的列清单。表名有显式 TableName 时按原文；其余列为常规 GORM 命名参考，未运行 ORM 验证。数据库实际类型、NULL、默认值、约束和迁移历史须在新项目中明确，不以 Go 类型或 JSON 键代替 DDL。

| Go 写法                      | Python 阅读类比        | 数据设计注意                                              |
| :--------------------------- | :--------------------- | :-------------------------------------------------------- |
| string / int / int64 / bool  | str / int / int / bool | Python int 不溢出不代表数据库、JSON 或金额转换没有上限    |
| float64                      | float                  | 金额实现需要明确 Decimal 或整数最小单位；不是机械照抄浮点 |
| \*T                          | T 或 None              | 区分未给值与显式零；不自动说明实际数据库允许 NULL         |
| []T / map[K]V                | list[T] / dict[K,V]    | 可能是临时字段或序列化数据，不自动建关联表                |
| json.RawMessage / 自定义结构 | JSON 值或结构化对象    | 检查 Scanner/Valuer 与 JSON schema                        |
| gorm.DeletedAt               | 软删除时间包装         | 查询过滤与唯一性必须一起设计                              |

机器数据：[[new-api-database-declarations.json]]。原始源码路径与行号均固定到本次快照；下方“解释”优先保留源代码注释，没有注释时只给语义提示，不能把它当额外约束。

---

### 1.3 Channel：channels

来源：[[new-api-ref--model--channel.go.txt]] 第 23 行。表名依据：ORM 命名参考，未运行迁移核验。

| Go 字段            | Go 类型     | JSON 键              | GORM 声明                          | 映射       | 注释或语义提示                                                          |
| :----------------- | :---------- | :------------------- | :--------------------------------- | :--------- | :---------------------------------------------------------------------- |
| Id                 | int         | id                   | 未显式声明                         | 持久化声明 | 记录标识                                                                |
| Type               | int         | type                 | default:0                          | 持久化声明 | 类型标识                                                                |
| Key                | string      | key                  | not null                           | 持久化声明 | 键值或凭据，含义取决于所属实体                                          |
| OpenAIOrganization | \*string    | openai_organization  | 未显式声明                         | 持久化声明 | 该实体的 OpenAIOrganization 属性；精确约束见声明与业务说明              |
| TestModel          | \*string    | test_model           | 未显式声明                         | 持久化声明 | 该实体的 TestModel 属性；精确约束见声明与业务说明                       |
| Status             | int         | status               | default:1                          | 持久化声明 | 状态，枚举定义按所属实体解释                                            |
| Name               | string      | name                 | index                              | 持久化声明 | 名称                                                                    |
| Weight             | \*uint      | weight               | default:0                          | 持久化声明 | 路由权重                                                                |
| CreatedTime        | int64       | created_time         | bigint                             | 持久化声明 | 创建时间                                                                |
| TestTime           | int64       | test_time            | bigint                             | 持久化声明 | 该实体的 TestTime 属性；精确约束见声明与业务说明                        |
| ResponseTime       | int         | response_time        | 未显式声明                         | 持久化声明 | in milliseconds                                                         |
| BaseURL            | \*string    | base_url             | column:base_url;default:''         | 持久化声明 | 该实体的 BaseURL 属性；精确约束见声明与业务说明                         |
| Other              | string      | other                | 未显式声明                         | 持久化声明 | 扩展信息                                                                |
| Balance            | float64     | balance              | 未显式声明                         | 持久化声明 | in USD                                                                  |
| BalanceUpdatedTime | int64       | balance_updated_time | bigint                             | 持久化声明 | 该实体的 BalanceUpdatedTime 属性；精确约束见声明与业务说明              |
| Models             | string      | models               | 未显式声明                         | 持久化声明 | 该实体的 Models 属性；精确约束见声明与业务说明                          |
| Group              | string      | group                | type:varchar(64);default:'default' | 持久化声明 | 业务分组                                                                |
| UsedQuota          | int64       | used_quota           | bigint;default:0                   | 持久化声明 | 累计使用额度                                                            |
| ModelMapping       | \*string    | model_mapping        | type:text                          | 持久化声明 | 该实体的 ModelMapping 属性；精确约束见声明与业务说明                    |
| StatusCodeMapping  | \*string    | status_code_mapping  | type:varchar(1024);default:''      | 持久化声明 | MaxInputTokens \*int `json:"max_input_tokens" gorm:"default:0"`         |
| Priority           | \*int64     | priority             | bigint;default:0                   | 持久化声明 | 优先级                                                                  |
| AutoBan            | \*int       | auto_ban             | default:1                          | 持久化声明 | 该实体的 AutoBan 属性；精确约束见声明与业务说明                         |
| OtherInfo          | string      | other_info           | 未显式声明                         | 持久化声明 | 该实体的 OtherInfo 属性；精确约束见声明与业务说明                       |
| Tag                | \*string    | tag                  | index                              | 持久化声明 | 该实体的 Tag 属性；精确约束见声明与业务说明                             |
| Setting            | \*string    | setting              | type:text                          | 持久化声明 | 渠道额外设置                                                            |
| ParamOverride      | \*string    | param_override       | type:text                          | 持久化声明 | 该实体的 ParamOverride 属性；精确约束见声明与业务说明                   |
| HeaderOverride     | \*string    | header_override      | type:text                          | 持久化声明 | 该实体的 HeaderOverride 属性；精确约束见声明与业务说明                  |
| Remark             | \*string    | remark               | type:varchar(255)                  | 持久化声明 | 备注；输入校验标签 max=255                                              |
| ChannelInfo        | ChannelInfo | channel_info         | type:json                          | 持久化声明 | add after v0.8.5                                                        |
| OtherSettings      | string      | settings             | column:settings                    | 持久化声明 | 其他设置，存储azure版本等不需要检索的信息，详见dto.ChannelOtherSettings |
| Keys               | []string    | -                    | -                                  | 不落库     | cache info                                                              |

---

### 1.4 Token：tokens

来源：[[new-api-ref--model--token.go.txt]] 第 14 行。表名依据：ORM 命名参考，未运行迁移核验。

| Go 字段             | Go 类型        | JSON 键                | GORM 声明                     | 映射       | 注释或语义提示                                                           |
| :------------------ | :------------- | :--------------------- | :---------------------------- | :--------- | :----------------------------------------------------------------------- |
| Id                  | int            | id                     | 未显式声明                    | 持久化声明 | 记录标识                                                                 |
| UserId              | int            | user_id                | index                         | 持久化声明 | 所属用户标识                                                             |
| Key                 | string         | key                    | type:varchar(128);uniqueIndex | 持久化声明 | 键值或凭据，含义取决于所属实体                                           |
| Status              | int            | status                 | default:1                     | 持久化声明 | 状态，枚举定义按所属实体解释                                             |
| Name                | string         | name                   | index                         | 持久化声明 | 名称                                                                     |
| CreatedTime         | int64          | created_time           | bigint                        | 持久化声明 | 创建时间                                                                 |
| AccessedTime        | int64          | accessed_time          | bigint                        | 持久化声明 | 该实体的 AccessedTime 属性；精确约束见声明与业务说明                     |
| ExpiredTime         | int64          | expired_time           | bigint;default:-1             | 持久化声明 | -1 means never expired                                                   |
| RemainQuota         | int            | remain_quota           | default:0                     | 持久化声明 | 令牌剩余预算                                                             |
| UnlimitedQuota      | bool           | unlimited_quota        | 未显式声明                    | 持久化声明 | 该实体的 UnlimitedQuota 属性；精确约束见声明与业务说明                   |
| ModelLimitsEnabled  | bool           | model_limits_enabled   | 未显式声明                    | 持久化声明 | 该实体的 ModelLimitsEnabled 属性；精确约束见声明与业务说明               |
| ModelLimits         | string         | model_limits           | type:text                     | 持久化声明 | 模型限制内容                                                             |
| AllowIps            | \*string       | allow_ips              | default:''                    | 持久化声明 | 该实体的 AllowIps 属性；精确约束见声明与业务说明                         |
| UsedQuota           | int            | used_quota             | default:0                     | 持久化声明 | used quota                                                               |
| Group               | string         | group                  | default:''                    | 持久化声明 | 业务分组                                                                 |
| CrossGroupRetry     | bool           | cross_group_retry      | 未显式声明                    | 持久化声明 | 跨分组重试，仅auto分组有效                                               |
| AutoGroups          | string         | -                      | type:text                     | 持久化声明 | 该实体的 AutoGroups 属性；精确约束见声明与业务说明                       |
| DeletedAt           | gorm.DeletedAt | (未声明)               | index                         | 持久化声明 | 软删除标记，不是业务状态                                                 |
| AllowUserQuotaQuery | bool           | allow_user_quota_query | 未显式声明                    | 持久化声明 | 允许用此令牌查询所属用户的额度；新建令牌默认开启，已有令牌升级后保持关闭 |

---

### 1.5 User：users

来源：[[new-api-ref--model--user.go.txt]] 第 79 行。表名依据：ORM 命名参考，未运行迁移核验。

| Go 字段              | Go 类型                    | JSON 键                     | GORM 声明                                          | 映射       | 注释或语义提示                                                                                 |
| :------------------- | :------------------------- | :-------------------------- | :------------------------------------------------- | :--------- | :--------------------------------------------------------------------------------------------- |
| Id                   | int                        | id                          | 未显式声明                                         | 持久化声明 | 记录标识                                                                                       |
| Username             | string                     | username                    | unique;index                                       | 持久化声明 | 用户名；输入校验标签 max=20                                                                    |
| Password             | string                     | password                    | not null;                                          | 持久化声明 | 密码相关存储字段，不能按字段名推定存储算法；输入校验标签 min=8,max=128                         |
| HasPassword          | bool                       | -                           | -:all                                              | 不落库     | 该实体的 HasPassword 属性；精确约束见声明与业务说明                                            |
| OriginalPassword     | string                     | original_password           | -:all                                              | 不落库     | this field is only for Password change verification, don't save it to database!                |
| DisplayName          | string                     | display_name                | index                                              | 持久化声明 | 该实体的 DisplayName 属性；精确约束见声明与业务说明；输入校验标签 max=20                       |
| Role                 | int                        | role                        | type:int;default:1                                 | 持久化声明 | admin, common                                                                                  |
| Status               | int                        | status                      | type:int;default:1                                 | 持久化声明 | enabled, disabled                                                                              |
| Email                | string                     | email                       | index                                              | 持久化声明 | 邮箱；输入校验标签 max=50                                                                      |
| GitHubId             | string                     | github_id                   | column:github_id;index                             | 持久化声明 | 该实体的 GitHubId 属性；精确约束见声明与业务说明                                               |
| DiscordId            | string                     | discord_id                  | column:discord_id;index                            | 持久化声明 | 该实体的 DiscordId 属性；精确约束见声明与业务说明                                              |
| OidcId               | string                     | oidc_id                     | column:oidc_id;index                               | 持久化声明 | 该实体的 OidcId 属性；精确约束见声明与业务说明                                                 |
| WeChatId             | string                     | wechat_id                   | column:wechat_id;index                             | 持久化声明 | 该实体的 WeChatId 属性；精确约束见声明与业务说明                                               |
| TelegramId           | string                     | telegram_id                 | column:telegram_id;index                           | 持久化声明 | 该实体的 TelegramId 属性；精确约束见声明与业务说明                                             |
| VerificationCode     | string                     | verification_code           | -:all                                              | 不落库     | this field is only for Email verification, don't save it to database!                          |
| AccessToken          | \*string                   | -                           | type:char(32);column:access_token;uniqueIndex      | 持久化声明 | Deprecated: 旧版面板访问令牌，仅在升级后的过渡期内使用；删除 users.access_token 列时一并移除。 |
| AccessTokenCreatedAt | \*int64                    | -                           | type:bigint;column:access_token_created_at         | 持久化声明 | Deprecated: 旧版面板访问令牌，仅在升级后的过渡期内使用；删除 users.access_token 列时一并移除。 |
| Quota                | int                        | quota                       | type:int;default:0                                 | 持久化声明 | 内部额度计量                                                                                   |
| UsedQuota            | int                        | used_quota                  | type:int;default:0;column:used_quota               | 持久化声明 | used quota                                                                                     |
| RequestCount         | int                        | request_count               | type:int;default:0;                                | 持久化声明 | request number                                                                                 |
| Group                | string                     | group                       | type:varchar(64);default:'default'                 | 持久化声明 | 业务分组                                                                                       |
| AffCode              | string                     | aff_code                    | type:varchar(32);column:aff_code;uniqueIndex       | 持久化声明 | 该实体的 AffCode 属性；精确约束见声明与业务说明                                                |
| AffCount             | int                        | aff_count                   | type:int;default:0;column:aff_count                | 持久化声明 | 该实体的 AffCount 属性；精确约束见声明与业务说明                                               |
| AffQuota             | int                        | aff_quota                   | type:int;default:0;column:aff_quota                | 持久化声明 | 邀请剩余额度                                                                                   |
| AffHistoryQuota      | int                        | aff_history_quota           | type:int;default:0;column:aff_history              | 持久化声明 | 邀请历史额度                                                                                   |
| InviterId            | int                        | inviter_id                  | type:int;column:inviter_id;index                   | 持久化声明 | 该实体的 InviterId 属性；精确约束见声明与业务说明                                              |
| DeletedAt            | gorm.DeletedAt             | (未声明)                    | index                                              | 持久化声明 | 软删除标记，不是业务状态                                                                       |
| LinuxDOId            | string                     | linux_do_id                 | column:linux_do_id;index                           | 持久化声明 | 该实体的 LinuxDOId 属性；精确约束见声明与业务说明                                              |
| Setting              | string                     | setting                     | type:text;column:setting                           | 持久化声明 | 该实体的 Setting 属性；精确约束见声明与业务说明                                                |
| Remark               | string                     | remark,omitempty            | type:varchar(255)                                  | 持久化声明 | 备注；输入校验标签 max=255                                                                     |
| StripeCustomer       | string                     | stripe_customer             | type:varchar(64);column:stripe_customer;index      | 持久化声明 | 该实体的 StripeCustomer 属性；精确约束见声明与业务说明                                         |
| CreatedAt            | int64                      | created_at                  | autoCreateTime;column:created_at                   | 持久化声明 | 创建时间；精确单位看对应代码                                                                   |
| LastLoginAt          | int64                      | last_login_at               | default:0;column:last_login_at                     | 持久化声明 | 该实体的 LastLoginAt 属性；精确约束见声明与业务说明                                            |
| AuthVersion          | int64                      | -                           | type:bigint;not null;default:1;column:auth_version | 持久化声明 | 认证失效版本                                                                                   |
| AdminPermissions     | map[string]map[string]bool | admin_permissions,omitempty | -:all                                              | 不落库     | 该实体的 AdminPermissions 属性；精确约束见声明与业务说明                                       |

---

### 1.6 UserSession：user_sessions

来源：[[new-api-ref--model--user_session.go.txt]] 第 42 行。表名依据：显式 TableName。

| Go 字段             | Go 类型 | JSON 键                  | GORM 声明                                                                                                                         | 映射       | 注释或语义提示                                              |
| :------------------ | :------ | :----------------------- | :-------------------------------------------------------------------------------------------------------------------------------- | :--------- | :---------------------------------------------------------- |
| SID                 | string  | sid                      | column:sid;type:varchar(64);primaryKey                                                                                            | 持久化声明 | 会话主键                                                    |
| UserID              | int     | user_id                  | column:user_id;not null;index:idx_user_sessions_user_status_expiry,priority:1;index:idx_user_sessions_user_created,priority:1     | 持久化声明 | 所属用户标识                                                |
| Version             | int64   | version                  | type:bigint;not null;default:1                                                                                                    | 持久化声明 | 版本号                                                      |
| UserAuthVersion     | int64   | user_auth_version        | type:bigint;not null                                                                                                              | 持久化声明 | 该实体的 UserAuthVersion 属性；精确约束见声明与业务说明     |
| Status              | string  | status                   | type:varchar(16);not null;index:idx_user_sessions_user_status_expiry,priority:2;index:idx_user_sessions_status_revoked,priority:1 | 持久化声明 | 状态，枚举定义按所属实体解释                                |
| RefreshHash         | string  | -                        | type:char(64);not null                                                                                                            | 持久化声明 | 刷新凭据散列                                                |
| PreviousRefreshHash | string  | -                        | type:varchar(64)                                                                                                                  | 持久化声明 | 该实体的 PreviousRefreshHash 属性；精确约束见声明与业务说明 |
| PreviousValidUntil  | int64   | -                        | type:bigint;not null;default:0                                                                                                    | 持久化声明 | 该实体的 PreviousValidUntil 属性；精确约束见声明与业务说明  |
| LoginMethod         | string  | login_method             | type:varchar(32);not null                                                                                                         | 持久化声明 | 该实体的 LoginMethod 属性；精确约束见声明与业务说明         |
| IP                  | string  | ip                       | type:varchar(64)                                                                                                                  | 持久化声明 | 该实体的 IP 属性；精确约束见声明与业务说明                  |
| UserAgent           | string  | user_agent               | type:text                                                                                                                         | 持久化声明 | 该实体的 UserAgent 属性；精确约束见声明与业务说明           |
| CreatedAt           | int64   | created_at               | autoCreateTime;column:created_at;index:idx_user_sessions_user_created,priority:2                                                  | 持久化声明 | 创建时间；精确单位看对应代码                                |
| LastActiveAt        | int64   | last_active_at           | type:bigint;not null;column:last_active_at                                                                                        | 持久化声明 | 该实体的 LastActiveAt 属性；精确约束见声明与业务说明        |
| ExpiresAt           | int64   | expires_at               | type:bigint;not null;column:expires_at;index:idx_user_sessions_user_status_expiry,priority:3;index:idx_user_sessions_expires_at   | 持久化声明 | 到期时间                                                    |
| RevokedAt           | int64   | revoked_at,omitempty     | type:bigint;not null;default:0;column:revoked_at;index:idx_user_sessions_status_revoked,priority:2                                | 持久化声明 | 该实体的 RevokedAt 属性；精确约束见声明与业务说明           |
| RevokedReason       | string  | revoked_reason,omitempty | type:varchar(64);column:revoked_reason                                                                                            | 持久化声明 | 该实体的 RevokedReason 属性；精确约束见声明与业务说明       |

---

### 1.7 AuthFlow：auth_flows

来源：[[new-api-ref--model--auth_flow.go.txt]] 第 45 行。表名依据：显式 TableName。

| Go 字段    | Go 类型     | JSON 键               | GORM 声明                                                    | 映射       | 注释或语义提示                                     |
| :--------- | :---------- | :-------------------- | :----------------------------------------------------------- | :--------- | :------------------------------------------------- |
| Id         | int64       | id                    | primaryKey                                                   | 持久化声明 | 记录标识                                           |
| TokenHash  | string      | -                     | type:char(64);not null;uniqueIndex                           | 持久化声明 | 个人访问令牌指纹/散列                              |
| Purpose    | string      | purpose               | type:varchar(32);not null;index:idx_auth_flow_purpose_expiry | 持久化声明 | 该实体的 Purpose 属性；精确约束见声明与业务说明    |
| Provider   | string      | provider,omitempty    | type:varchar(64)                                             | 持久化声明 | 该实体的 Provider 属性；精确约束见声明与业务说明   |
| Intent     | string      | intent,omitempty      | type:varchar(16)                                             | 持久化声明 | 该实体的 Intent 属性；精确约束见声明与业务说明     |
| UserId     | int         | user_id,omitempty     | index                                                        | 持久化声明 | 所属用户标识                                       |
| SessionId  | string      | session_id,omitempty  | type:varchar(64);index                                       | 持久化声明 | 该实体的 SessionId 属性；精确约束见声明与业务说明  |
| Payload    | string      | -                     | type:text                                                    | 持久化声明 | 该实体的 Payload 属性；精确约束见声明与业务说明    |
| CreatedAt  | time.Time   | created_at            | 未显式声明                                                   | 持久化声明 | 创建时间；精确单位看对应代码                       |
| ExpiresAt  | time.Time   | expires_at            | not null;index:idx_auth_flow_purpose_expiry                  | 持久化声明 | 到期时间                                           |
| ConsumedAt | \*time.Time | consumed_at,omitempty | index                                                        | 持久化声明 | 该实体的 ConsumedAt 属性；精确约束见声明与业务说明 |

---

### 1.8 ExternalIdentityClaim：external_identity_claims

来源：[[new-api-ref--model--external_identity_claim.go.txt]] 第 21 行。表名依据：显式 TableName。

| Go 字段   | Go 类型   | JSON 键    | GORM 声明                                                                                                                        | 映射       | 注释或语义提示                                   |
| :-------- | :-------- | :--------- | :------------------------------------------------------------------------------------------------------------------------------- | :--------- | :----------------------------------------------- |
| Id        | int64     | id         | primaryKey                                                                                                                       | 持久化声明 | 记录标识                                         |
| Provider  | string    | provider   | type:varchar(32);not null;uniqueIndex:idx_external_identity_subject,priority:1;uniqueIndex:idx_external_identity_user,priority:1 | 持久化声明 | 该实体的 Provider 属性；精确约束见声明与业务说明 |
| Subject   | string    | subject    | type:varchar(128);not null;uniqueIndex:idx_external_identity_subject,priority:2                                                  | 持久化声明 | 该实体的 Subject 属性；精确约束见声明与业务说明  |
| UserId    | int       | user_id    | not null;index;uniqueIndex:idx_external_identity_user,priority:2                                                                 | 持久化声明 | 所属用户标识                                     |
| CreatedAt | time.Time | created_at | 未显式声明                                                                                                                       | 持久化声明 | 创建时间；精确单位看对应代码                     |

---

### 1.9 PasskeyCredential：passkey_credentials

来源：[[new-api-ref--model--passkey.go.txt]] 第 22 行。表名依据：ORM 命名参考，未运行迁移核验。

| Go 字段         | Go 类型        | JSON 键          | GORM 声明                              | 映射       | 注释或语义提示                                          |
| :-------------- | :------------- | :--------------- | :------------------------------------- | :--------- | :------------------------------------------------------ |
| ID              | int            | id               | primaryKey                             | 持久化声明 | 记录标识                                                |
| UserID          | int            | user_id          | uniqueIndex;not null                   | 持久化声明 | 所属用户标识                                            |
| RPID            | \*string       | rp_id,omitempty  | column:rp_id;type:varchar(253)         | 持久化声明 | 该实体的 RPID 属性；精确约束见声明与业务说明            |
| CredentialID    | string         | credential_id    | type:varchar(512);uniqueIndex;not null | 持久化声明 | base64 encoded                                          |
| PublicKey       | string         | public_key       | type:text;not null                     | 持久化声明 | base64 encoded                                          |
| AttestationType | string         | attestation_type | type:varchar(255)                      | 持久化声明 | 该实体的 AttestationType 属性；精确约束见声明与业务说明 |
| AAGUID          | string         | aaguid           | type:varchar(512)                      | 持久化声明 | base64 encoded                                          |
| SignCount       | uint32         | sign_count       | default:0                              | 持久化声明 | 该实体的 SignCount 属性；精确约束见声明与业务说明       |
| CloneWarning    | bool           | clone_warning    | 未显式声明                             | 持久化声明 | 该实体的 CloneWarning 属性；精确约束见声明与业务说明    |
| UserPresent     | bool           | user_present     | 未显式声明                             | 持久化声明 | 该实体的 UserPresent 属性；精确约束见声明与业务说明     |
| UserVerified    | bool           | user_verified    | 未显式声明                             | 持久化声明 | 该实体的 UserVerified 属性；精确约束见声明与业务说明    |
| BackupEligible  | bool           | backup_eligible  | 未显式声明                             | 持久化声明 | 该实体的 BackupEligible 属性；精确约束见声明与业务说明  |
| BackupState     | bool           | backup_state     | 未显式声明                             | 持久化声明 | 该实体的 BackupState 属性；精确约束见声明与业务说明     |
| Transports      | string         | transports       | type:text                              | 持久化声明 | 该实体的 Transports 属性；精确约束见声明与业务说明      |
| Attachment      | string         | attachment       | type:varchar(32)                       | 持久化声明 | 该实体的 Attachment 属性；精确约束见声明与业务说明      |
| LastUsedAt      | \*time.Time    | last_used_at     | 未显式声明                             | 持久化声明 | 该实体的 LastUsedAt 属性；精确约束见声明与业务说明      |
| CreatedAt       | time.Time      | created_at       | 未显式声明                             | 持久化声明 | 创建时间；精确单位看对应代码                            |
| UpdatedAt       | time.Time      | updated_at       | 未显式声明                             | 持久化声明 | 更新时间                                                |
| DeletedAt       | gorm.DeletedAt | -                | index                                  | 持久化声明 | 软删除标记，不是业务状态                                |

---

### 1.10 Option：options

来源：[[new-api-ref--model--option.go.txt]] 第 21 行。表名依据：ORM 命名参考，未运行迁移核验。

| Go 字段 | Go 类型 | JSON 键 | GORM 声明  | 映射       | 注释或语义提示                 |
| :------ | :------ | :------ | :--------- | :--------- | :----------------------------- |
| Key     | string  | key     | primaryKey | 持久化声明 | 键值或凭据，含义取决于所属实体 |
| Value   | string  | value   | 未显式声明 | 持久化声明 | 配置值                         |

---

### 1.11 LoginEncryptionKey：login_encryption_keys

来源：[[new-api-ref--model--password_crypto.go.txt]] 第 17 行。表名依据：ORM 命名参考，未运行迁移核验。

| Go 字段       | Go 类型 | JSON 键 | GORM 声明                             | 映射       | 注释或语义提示                                        |
| :------------ | :------ | :------ | :------------------------------------ | :--------- | :---------------------------------------------------- |
| ID            | uint    | -       | primaryKey                            | 持久化声明 | 记录标识                                              |
| Slot          | string  | -       | type:varchar(32);not null;uniqueIndex | 持久化声明 | 该实体的 Slot 属性；精确约束见声明与业务说明          |
| PrivateKeyPEM | string  | -       | type:text;not null                    | 持久化声明 | 该实体的 PrivateKeyPEM 属性；精确约束见声明与业务说明 |

---

### 1.12 Redemption：redemptions

来源：[[new-api-ref--model--redemption.go.txt]] 第 13 行。表名依据：ORM 命名参考，未运行迁移核验。

| Go 字段      | Go 类型        | JSON 键       | GORM 声明                 | 映射       | 注释或语义提示                                       |
| :----------- | :------------- | :------------ | :------------------------ | :--------- | :--------------------------------------------------- |
| Id           | int            | id            | 未显式声明                | 持久化声明 | 记录标识                                             |
| UserId       | int            | user_id       | 未显式声明                | 持久化声明 | 所属用户标识                                         |
| Key          | string         | key           | type:char(32);uniqueIndex | 持久化声明 | 键值或凭据，含义取决于所属实体                       |
| Status       | int            | status        | default:1                 | 持久化声明 | 状态，枚举定义按所属实体解释                         |
| Name         | string         | name          | index                     | 持久化声明 | 名称                                                 |
| Quota        | int            | quota         | default:100               | 持久化声明 | 内部额度计量                                         |
| CreatedTime  | int64          | created_time  | bigint                    | 持久化声明 | 创建时间                                             |
| RedeemedTime | int64          | redeemed_time | bigint                    | 持久化声明 | 该实体的 RedeemedTime 属性；精确约束见声明与业务说明 |
| Count        | int            | count         | -:all                     | 不落库     | only for api request                                 |
| UsedUserId   | int            | used_user_id  | 未显式声明                | 持久化声明 | 该实体的 UsedUserId 属性；精确约束见声明与业务说明   |
| DeletedAt    | gorm.DeletedAt | (未声明)      | index                     | 持久化声明 | 软删除标记，不是业务状态                             |
| ExpiredTime  | int64          | expired_time  | bigint                    | 持久化声明 | 过期时间，0 表示不过期                               |

---

### 1.13 Ability：abilities

来源：[[new-api-ref--model--ability.go.txt]] 第 18 行。表名依据：ORM 命名参考，未运行迁移核验。

| Go 字段   | Go 类型  | JSON 键    | GORM 声明                                        | 映射       | 注释或语义提示                                |
| :-------- | :------- | :--------- | :----------------------------------------------- | :--------- | :-------------------------------------------- |
| Group     | string   | group      | type:varchar(64);primaryKey;autoIncrement:false  | 持久化声明 | 业务分组                                      |
| Model     | string   | model      | type:varchar(255);primaryKey;autoIncrement:false | 持久化声明 | 该实体的 Model 属性；精确约束见声明与业务说明 |
| ChannelId | int      | channel_id | primaryKey;autoIncrement:false;index             | 持久化声明 | 关联渠道                                      |
| Enabled   | bool     | enabled    | 未显式声明                                       | 持久化声明 | 启用标记                                      |
| Priority  | \*int64  | priority   | bigint;default:0;index                           | 持久化声明 | 优先级                                        |
| Weight    | uint     | weight     | default:0;index                                  | 持久化声明 | 路由权重                                      |
| Tag       | \*string | tag        | index                                            | 持久化声明 | 该实体的 Tag 属性；精确约束见声明与业务说明   |

---

### 1.14 Log：logs

来源：[[new-api-ref--model--log.go.txt]] 第 57 行。表名依据：ORM 命名参考，未运行迁移核验。

| Go 字段           | Go 类型 | JSON 键                       | GORM 声明                                                           | 映射       | 注释或语义提示                                            |
| :---------------- | :------ | :---------------------------- | :------------------------------------------------------------------ | :--------- | :-------------------------------------------------------- |
| Id                | int     | id                            | index:idx_created_at_id,priority:2;index:idx_user_id_id,priority:2  | 持久化声明 | 记录标识                                                  |
| UserId            | int     | user_id                       | index;index:idx_user_id_id,priority:1                               | 持久化声明 | 所属用户标识                                              |
| CreatedAt         | int64   | created_at                    | bigint;index:idx_created_at_id,priority:1;index:idx_created_at_type | 持久化声明 | 创建时间；精确单位看对应代码                              |
| Type              | int     | type                          | index:idx_created_at_type                                           | 持久化声明 | 类型标识                                                  |
| Content           | string  | content                       | 未显式声明                                                          | 持久化声明 | 该实体的 Content 属性；精确约束见声明与业务说明           |
| Username          | string  | username                      | index;index:index_username_model_name,priority:2;default:''         | 持久化声明 | 用户名                                                    |
| TokenName         | string  | token_name                    | index;default:''                                                    | 持久化声明 | 该实体的 TokenName 属性；精确约束见声明与业务说明         |
| ModelName         | string  | model_name                    | index;index:index_username_model_name,priority:1;default:''         | 持久化声明 | 模型标识                                                  |
| Quota             | int     | quota                         | default:0                                                           | 持久化声明 | 内部额度计量                                              |
| PromptTokens      | int     | prompt_tokens                 | default:0                                                           | 持久化声明 | 该实体的 PromptTokens 属性；精确约束见声明与业务说明      |
| CompletionTokens  | int     | completion_tokens             | default:0                                                           | 持久化声明 | 该实体的 CompletionTokens 属性；精确约束见声明与业务说明  |
| UseTime           | int     | use_time                      | default:0                                                           | 持久化声明 | 该实体的 UseTime 属性；精确约束见声明与业务说明           |
| IsStream          | bool    | is_stream                     | 未显式声明                                                          | 持久化声明 | 该实体的 IsStream 属性；精确约束见声明与业务说明          |
| ChannelId         | int     | channel                       | index                                                               | 持久化声明 | 关联渠道                                                  |
| ChannelName       | string  | channel_name                  | ->                                                                  | 只读映射   | 该实体的 ChannelName 属性；精确约束见声明与业务说明       |
| TokenId           | int     | token_id                      | default:0;index                                                     | 持久化声明 | 关联 API Key 记录                                         |
| Group             | string  | group                         | index                                                               | 持久化声明 | 业务分组                                                  |
| Ip                | string  | ip                            | index;default:''                                                    | 持久化声明 | 该实体的 Ip 属性；精确约束见声明与业务说明                |
| RequestId         | string  | request_id,omitempty          | type:varchar(64);index:idx_logs_request_id;default:''               | 持久化声明 | 请求标识                                                  |
| UpstreamRequestId | string  | upstream_request_id,omitempty | type:varchar(128);index:idx_logs_upstream_request_id;default:''     | 持久化声明 | 该实体的 UpstreamRequestId 属性；精确约束见声明与业务说明 |
| Other             | string  | other                         | 未显式声明                                                          | 持久化声明 | 扩展信息                                                  |

---

### 1.15 Midjourney：midjourneys

来源：[[new-api-ref--model--midjourney.go.txt]] 第 3 行。表名依据：ORM 命名参考，未运行迁移核验。

| Go 字段          | Go 类型 | JSON 键     | GORM 声明              | 映射       | 注释或语义提示                                           |
| :--------------- | :------ | :---------- | :--------------------- | :--------- | :------------------------------------------------------- |
| Id               | int     | id          | 未显式声明             | 持久化声明 | 记录标识                                                 |
| Code             | int     | code        | 未显式声明             | 持久化声明 | 该实体的 Code 属性；精确约束见声明与业务说明             |
| UserId           | int     | user_id     | index                  | 持久化声明 | 所属用户标识                                             |
| Action           | string  | action      | type:varchar(40);index | 持久化声明 | 该实体的 Action 属性；精确约束见声明与业务说明           |
| MjId             | string  | mj_id       | index                  | 持久化声明 | 该实体的 MjId 属性；精确约束见声明与业务说明             |
| Prompt           | string  | prompt      | 未显式声明             | 持久化声明 | 该实体的 Prompt 属性；精确约束见声明与业务说明           |
| PromptEn         | string  | prompt_en   | 未显式声明             | 持久化声明 | 该实体的 PromptEn 属性；精确约束见声明与业务说明         |
| Description      | string  | description | 未显式声明             | 持久化声明 | 该实体的 Description 属性；精确约束见声明与业务说明      |
| State            | string  | state       | 未显式声明             | 持久化声明 | 该实体的 State 属性；精确约束见声明与业务说明            |
| SubmitTime       | int64   | submit_time | index                  | 持久化声明 | 该实体的 SubmitTime 属性；精确约束见声明与业务说明       |
| StartTime        | int64   | start_time  | index                  | 持久化声明 | 该实体的 StartTime 属性；精确约束见声明与业务说明        |
| FinishTime       | int64   | finish_time | index                  | 持久化声明 | 该实体的 FinishTime 属性；精确约束见声明与业务说明       |
| ImageUrl         | string  | image_url   | 未显式声明             | 持久化声明 | 该实体的 ImageUrl 属性；精确约束见声明与业务说明         |
| VideoUrl         | string  | video_url   | 未显式声明             | 持久化声明 | 该实体的 VideoUrl 属性；精确约束见声明与业务说明         |
| VideoUrls        | string  | video_urls  | 未显式声明             | 持久化声明 | 该实体的 VideoUrls 属性；精确约束见声明与业务说明        |
| Status           | string  | status      | type:varchar(20);index | 持久化声明 | 状态，枚举定义按所属实体解释                             |
| Progress         | string  | progress    | type:varchar(30);index | 持久化声明 | 该实体的 Progress 属性；精确约束见声明与业务说明         |
| FailReason       | string  | fail_reason | 未显式声明             | 持久化声明 | 该实体的 FailReason 属性；精确约束见声明与业务说明       |
| ChannelId        | int     | channel_id  | 未显式声明             | 持久化声明 | 关联渠道                                                 |
| Quota            | int     | quota       | 未显式声明             | 持久化声明 | 内部额度计量                                             |
| Buttons          | string  | buttons     | 未显式声明             | 持久化声明 | 该实体的 Buttons 属性；精确约束见声明与业务说明          |
| Properties       | string  | properties  | 未显式声明             | 持久化声明 | 该实体的 Properties 属性；精确约束见声明与业务说明       |
| TokenId          | int     | -           | default:0              | 持久化声明 | 关联 API Key 记录                                        |
| BillingChannelId | int     | -           | default:0              | 持久化声明 | 该实体的 BillingChannelId 属性；精确约束见声明与业务说明 |

---

### 1.16 TopUp：top_ups

来源：[[new-api-ref--model--topup.go.txt]] 第 15 行。表名依据：ORM 命名参考，未运行迁移核验。

| Go 字段         | Go 类型 | JSON 键          | GORM 声明                      | 映射       | 注释或语义提示                                          |
| :-------------- | :------ | :--------------- | :----------------------------- | :--------- | :------------------------------------------------------ |
| Id              | int     | id               | 未显式声明                     | 持久化声明 | 记录标识                                                |
| UserId          | int     | user_id          | index                          | 持久化声明 | 所属用户标识                                            |
| Amount          | int64   | amount           | 未显式声明                     | 持久化声明 | 该实体的 Amount 属性；精确约束见声明与业务说明          |
| Money           | float64 | money            | 未显式声明                     | 持久化声明 | 支付金额相关字段，结合币种与控制器解释                  |
| TradeNo         | string  | trade_no         | unique;type:varchar(255);index | 持久化声明 | 支付业务单号                                            |
| PaymentMethod   | string  | payment_method   | type:varchar(50)               | 持久化声明 | 该实体的 PaymentMethod 属性；精确约束见声明与业务说明   |
| PaymentProvider | string  | payment_provider | type:varchar(50);default:''    | 持久化声明 | 该实体的 PaymentProvider 属性；精确约束见声明与业务说明 |
| CreateTime      | int64   | create_time      | 未显式声明                     | 持久化声明 | 该实体的 CreateTime 属性；精确约束见声明与业务说明      |
| CompleteTime    | int64   | complete_time    | 未显式声明                     | 持久化声明 | 该实体的 CompleteTime 属性；精确约束见声明与业务说明    |
| Status          | string  | status           | 未显式声明                     | 持久化声明 | 状态，枚举定义按所属实体解释                            |

---

### 1.17 QuotaData：quota_data

来源：[[new-api-ref--model--usedata.go.txt]] 第 13 行。表名依据：ORM 命名参考，未运行迁移核验。

| Go 字段             | Go 类型 | JSON 键               | GORM 声明                                                   | 映射       | 注释或语义提示                                              |
| :------------------ | :------ | :-------------------- | :---------------------------------------------------------- | :--------- | :---------------------------------------------------------- |
| Id                  | int     | id                    | 未显式声明                                                  | 持久化声明 | 记录标识                                                    |
| UserID              | int     | user_id               | index                                                       | 持久化声明 | 所属用户标识                                                |
| Username            | string  | username              | index:idx_qdt_model_user_name,priority:2;size:64;default:'' | 持久化声明 | 用户名                                                      |
| ModelName           | string  | model_name            | index:idx_qdt_model_user_name,priority:1;size:64;default:'' | 持久化声明 | 模型标识                                                    |
| CreatedAt           | int64   | created_at            | bigint;index:idx_qdt_created_at,priority:2                  | 持久化声明 | 创建时间；精确单位看对应代码                                |
| UseGroup            | string  | use_group             | index;size:64;default:''                                    | 持久化声明 | 该实体的 UseGroup 属性；精确约束见声明与业务说明            |
| TokenID             | int     | token_id              | index;default:0                                             | 持久化声明 | 该实体的 TokenID 属性；精确约束见声明与业务说明             |
| ChannelID           | int     | channel_id            | index;default:0                                             | 持久化声明 | 该实体的 ChannelID 属性；精确约束见声明与业务说明           |
| NodeName            | string  | node_name             | index;size:64;default:''                                    | 持久化声明 | 该实体的 NodeName 属性；精确约束见声明与业务说明            |
| TokenUsed           | int     | token_used            | default:0                                                   | 持久化声明 | 该实体的 TokenUsed 属性；精确约束见声明与业务说明           |
| Count               | int     | count                 | default:0                                                   | 持久化声明 | 该实体的 Count 属性；精确约束见声明与业务说明               |
| Quota               | int     | quota                 | default:0                                                   | 持久化声明 | 内部额度计量                                                |
| CacheReadTokens     | int64   | cache_read_tokens     | default:0                                                   | 持久化声明 | 该实体的 CacheReadTokens 属性；精确约束见声明与业务说明     |
| CacheCreationTokens | int64   | cache_creation_tokens | default:0                                                   | 持久化声明 | 该实体的 CacheCreationTokens 属性；精确约束见声明与业务说明 |

---

### 1.18 Task：tasks

来源：[[new-api-ref--model--task.go.txt]] 第 50 行。表名依据：ORM 命名参考，未运行迁移核验。

| Go 字段     | Go 类型               | JSON 键            | GORM 声明                     | 映射       | 注释或语义提示                                     |
| :---------- | :-------------------- | :----------------- | :---------------------------- | :--------- | :------------------------------------------------- |
| ID          | int64                 | id                 | primary_key;AUTO_INCREMENT    | 持久化声明 | 记录标识                                           |
| CreatedAt   | int64                 | created_at         | index                         | 持久化声明 | 创建时间；精确单位看对应代码                       |
| UpdatedAt   | int64                 | updated_at         | 未显式声明                    | 持久化声明 | 更新时间                                           |
| TaskID      | string                | task_id            | type:varchar(191);index       | 持久化声明 | 第三方id，不一定有/ song id\ Task id               |
| Platform    | constant.TaskPlatform | platform           | type:varchar(30);index        | 持久化声明 | 平台                                               |
| UserId      | int                   | user_id            | index                         | 持久化声明 | 所属用户标识                                       |
| Group       | string                | group              | type:varchar(50)              | 持久化声明 | 修正计费用                                         |
| ChannelId   | int                   | channel_id         | index                         | 持久化声明 | 关联渠道                                           |
| Quota       | int                   | quota              | 未显式声明                    | 持久化声明 | 内部额度计量                                       |
| Action      | string                | action             | type:varchar(40);index        | 持久化声明 | 任务类型, song, lyrics, description-mode           |
| Status      | TaskStatus            | status             | type:varchar(20);index        | 持久化声明 | 任务状态                                           |
| FailReason  | string                | fail_reason        | 未显式声明                    | 持久化声明 | 该实体的 FailReason 属性；精确约束见声明与业务说明 |
| SubmitTime  | int64                 | submit_time        | index                         | 持久化声明 | 该实体的 SubmitTime 属性；精确约束见声明与业务说明 |
| StartTime   | int64                 | start_time         | index                         | 持久化声明 | 该实体的 StartTime 属性；精确约束见声明与业务说明  |
| FinishTime  | int64                 | finish_time        | index                         | 持久化声明 | 该实体的 FinishTime 属性；精确约束见声明与业务说明 |
| Progress    | string                | progress           | type:varchar(20);index        | 持久化声明 | 该实体的 Progress 属性；精确约束见声明与业务说明   |
| Properties  | Properties            | properties         | type:json                     | 持久化声明 | 该实体的 Properties 属性；精确约束见声明与业务说明 |
| Username    | string                | username,omitempty | -                             | 不落库     | 用户名                                             |
| PrivateData | TaskPrivateData       | -                  | column:private_data;type:json | 持久化声明 | 禁止返回给用户，内部可能包含key等隐私信息          |
| Data        | json.RawMessage       | data               | type:json                     | 持久化声明 | 该实体的 Data 属性；精确约束见声明与业务说明       |

---

### 1.19 TaskPlugin：task_plugins

来源：[[new-api-ref--model--task_plugin.go.txt]] 第 78 行。表名依据：ORM 命名参考，未运行迁移核验。

| Go 字段    | Go 类型  | JSON 键     | GORM 声明                                                           | 映射       | 注释或语义提示                                                                                                                                                                                                                                                                                                                                                     |
| :--------- | :------- | :---------- | :------------------------------------------------------------------ | :--------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Id         | int64    | id          | 未显式声明                                                          | 持久化声明 | 记录标识                                                                                                                                                                                                                                                                                                                                                           |
| Key        | string   | key         | size:128;not null;uniqueIndex:uk_task_plugin_key_version,priority:1 | 持久化声明 | 键值或凭据，含义取决于所属实体                                                                                                                                                                                                                                                                                                                                     |
| APIVersion | int      | api_version | not null                                                            | 持久化声明 | 该实体的 APIVersion 属性；精确约束见声明与业务说明                                                                                                                                                                                                                                                                                                                 |
| Version    | string   | version     | size:64;not null;uniqueIndex:uk_task_plugin_key_version,priority:2  | 持久化声明 | 版本号                                                                                                                                                                                                                                                                                                                                                             |
| Source     | LongText | source      | not null                                                            | 持久化声明 | 该实体的 Source 属性；精确约束见声明与业务说明                                                                                                                                                                                                                                                                                                                     |
| SourceHash | string   | source_hash | size:64;not null                                                    | 持久化声明 | 该实体的 SourceHash 属性；精确约束见声明与业务说明                                                                                                                                                                                                                                                                                                                 |
| Icon       | LongText | -           | 未显式声明                                                          | 持久化声明 | Icon is the plugin logo shipped as a sidecar icon.svg / icon.png next to plugin.js, stored as a data URI so one column carries both the media type and the bytes. It never travels inside list or detail JSON; the UI loads it through GET /api/plugin/task/:key/icon. LongText keeps the 512 KiB icon cap storable on MySQL, where a bare TEXT holds only 64 KiB. |
| Enabled    | bool     | enabled     | not null                                                            | 持久化声明 | 启用标记                                                                                                                                                                                                                                                                                                                                                           |
| Active     | bool     | active      | not null;index                                                      | 持久化声明 | 该实体的 Active 属性；精确约束见声明与业务说明                                                                                                                                                                                                                                                                                                                     |
| CreatedAt  | int64    | created_at  | not null                                                            | 持久化声明 | 创建时间；精确单位看对应代码                                                                                                                                                                                                                                                                                                                                       |
| Remark     | string   | remark      | type:text                                                           | 持久化声明 | 备注                                                                                                                                                                                                                                                                                                                                                               |

---

### 1.20 Model：models

来源：[[new-api-ref--model--model_meta.go.txt]] 第 35 行。表名依据：ORM 命名参考，未运行迁移核验。

| Go 字段                | Go 类型          | JSON 键                       | GORM 声明                                                        | 映射       | 注释或语义提示                                                 |
| :--------------------- | :--------------- | :---------------------------- | :--------------------------------------------------------------- | :--------- | :------------------------------------------------------------- |
| Id                     | int              | id                            | 未显式声明                                                       | 持久化声明 | 记录标识                                                       |
| ModelName              | string           | model_name                    | size:128;not null;uniqueIndex:uk_model_name_delete_at,priority:1 | 持久化声明 | 模型标识                                                       |
| Description            | string           | description,omitempty         | type:text                                                        | 持久化声明 | 该实体的 Description 属性；精确约束见声明与业务说明            |
| Icon                   | string           | icon,omitempty                | type:varchar(128)                                                | 持久化声明 | 该实体的 Icon 属性；精确约束见声明与业务说明                   |
| Tags                   | string           | tags,omitempty                | type:varchar(255)                                                | 持久化声明 | 该实体的 Tags 属性；精确约束见声明与业务说明                   |
| VendorID               | int              | vendor_id,omitempty           | index                                                            | 持久化声明 | 该实体的 VendorID 属性；精确约束见声明与业务说明               |
| Endpoints              | string           | endpoints,omitempty           | type:text                                                        | 持久化声明 | 该实体的 Endpoints 属性；精确约束见声明与业务说明              |
| SupportedEndpoints     | []string         | supported_endpoints,omitempty | -                                                                | 不落库     | 该实体的 SupportedEndpoints 属性；精确约束见声明与业务说明     |
| Status                 | int              | status                        | default:1                                                        | 持久化声明 | 状态，枚举定义按所属实体解释                                   |
| SyncOfficial           | int              | sync_official                 | default:1                                                        | 持久化声明 | 该实体的 SyncOfficial 属性；精确约束见声明与业务说明           |
| CreatedTime            | int64            | created_time                  | bigint                                                           | 持久化声明 | 创建时间                                                       |
| UpdatedTime            | int64            | updated_time                  | bigint                                                           | 持久化声明 | 该实体的 UpdatedTime 属性；精确约束见声明与业务说明            |
| DeletedAt              | gorm.DeletedAt   | -                             | index;uniqueIndex:uk_model_name_delete_at,priority:2             | 持久化声明 | 软删除标记，不是业务状态                                       |
| BoundChannels          | []BoundChannel   | bound_channels,omitempty      | -                                                                | 不落库     | 该实体的 BoundChannels 属性；精确约束见声明与业务说明          |
| EnableGroups           | []string         | enable_groups,omitempty       | -                                                                | 不落库     | 该实体的 EnableGroups 属性；精确约束见声明与业务说明           |
| QuotaTypes             | []int            | quota_types,omitempty         | -                                                                | 不落库     | 该实体的 QuotaTypes 属性；精确约束见声明与业务说明             |
| NameRule               | int              | name_rule                     | default:0                                                        | 持久化声明 | 该实体的 NameRule 属性；精确约束见声明与业务说明               |
| MatchedModels          | []string         | matched_models,omitempty      | -                                                                | 不落库     | 该实体的 MatchedModels 属性；精确约束见声明与业务说明          |
| MatchedCount           | int              | matched_count,omitempty       | -                                                                | 不落库     | 该实体的 MatchedCount 属性；精确约束见声明与业务说明           |
| HasMetadata            | bool             | has_metadata                  | -                                                                | 不落库     | 该实体的 HasMetadata 属性；精确约束见声明与业务说明            |
| ConfiguredChannelCount | int              | configured_channel_count      | -                                                                | 不落库     | 该实体的 ConfiguredChannelCount 属性；精确约束见声明与业务说明 |
| SquareState            | ModelSquareState | square_state                  | -                                                                | 不落库     | 该实体的 SquareState 属性；精确约束见声明与业务说明            |

---

### 1.21 Vendor：vendors

来源：[[new-api-ref--model--vendor_meta.go.txt]] 第 15 行。表名依据：ORM 命名参考，未运行迁移核验。

| Go 字段     | Go 类型        | JSON 键               | GORM 声明                                                         | 映射       | 注释或语义提示                                      |
| :---------- | :------------- | :-------------------- | :---------------------------------------------------------------- | :--------- | :-------------------------------------------------- |
| ModelCount  | int64          | model_count           | -                                                                 | 不落库     | 该实体的 ModelCount 属性；精确约束见声明与业务说明  |
| Version     | string         | version,omitempty     | -                                                                 | 不落库     | 版本号                                              |
| Id          | int            | id                    | 未显式声明                                                        | 持久化声明 | 记录标识                                            |
| Name        | string         | name                  | size:128;not null;uniqueIndex:uk_vendor_name_delete_at,priority:1 | 持久化声明 | 名称                                                |
| Description | string         | description,omitempty | type:text                                                         | 持久化声明 | 该实体的 Description 属性；精确约束见声明与业务说明 |
| Icon        | string         | icon,omitempty        | type:varchar(128)                                                 | 持久化声明 | 该实体的 Icon 属性；精确约束见声明与业务说明        |
| Status      | int            | status                | default:1                                                         | 持久化声明 | 状态，枚举定义按所属实体解释                        |
| CreatedTime | int64          | created_time          | bigint                                                            | 持久化声明 | 创建时间                                            |
| UpdatedTime | int64          | updated_time          | bigint                                                            | 持久化声明 | 该实体的 UpdatedTime 属性；精确约束见声明与业务说明 |
| DeletedAt   | gorm.DeletedAt | -                     | index;uniqueIndex:uk_vendor_name_delete_at,priority:2             | 持久化声明 | 软删除标记，不是业务状态                            |

---

### 1.22 PrefillGroup：prefill_groups

来源：[[new-api-ref--model--prefill_group.go.txt]] 第 78 行。表名依据：ORM 命名参考，未运行迁移核验。

| Go 字段     | Go 类型        | JSON 键               | GORM 声明                                                             | 映射       | 注释或语义提示                                      |
| :---------- | :------------- | :-------------------- | :-------------------------------------------------------------------- | :--------- | :-------------------------------------------------- |
| Id          | int            | id                    | 未显式声明                                                            | 持久化声明 | 记录标识                                            |
| Name        | string         | name                  | size:64;not null;uniqueIndex:uk_prefill_name,where:deleted_at IS NULL | 持久化声明 | 名称                                                |
| Type        | string         | type                  | size:32;index;not null                                                | 持久化声明 | 类型标识                                            |
| Items       | JSONValue      | items                 | type:json                                                             | 持久化声明 | 该实体的 Items 属性；精确约束见声明与业务说明       |
| Description | string         | description,omitempty | type:varchar(255)                                                     | 持久化声明 | 该实体的 Description 属性；精确约束见声明与业务说明 |
| CreatedTime | int64          | created_time          | bigint                                                                | 持久化声明 | 创建时间                                            |
| UpdatedTime | int64          | updated_time          | bigint                                                                | 持久化声明 | 该实体的 UpdatedTime 属性；精确约束见声明与业务说明 |
| DeletedAt   | gorm.DeletedAt | -                     | index                                                                 | 持久化声明 | 软删除标记，不是业务状态                            |

---

### 1.23 Setup：setups

来源：[[new-api-ref--model--setup.go.txt]] 第 3 行。表名依据：ORM 命名参考，未运行迁移核验。

| Go 字段       | Go 类型 | JSON 键        | GORM 声明                 | 映射       | 注释或语义提示                                        |
| :------------ | :------ | :------------- | :------------------------ | :--------- | :---------------------------------------------------- |
| ID            | uint    | id             | primaryKey                | 持久化声明 | 记录标识                                              |
| Version       | string  | version        | type:varchar(50);not null | 持久化声明 | 版本号                                                |
| InitializedAt | int64   | initialized_at | type:bigint;not null      | 持久化声明 | 该实体的 InitializedAt 属性；精确约束见声明与业务说明 |

---

### 1.24 TwoFA：two_fas

来源：[[new-api-ref--model--twofa.go.txt]] 第 14 行。表名依据：ORM 命名参考，未运行迁移核验。

| Go 字段        | Go 类型        | JSON 键                | GORM 声明                  | 映射       | 注释或语义提示                                         |
| :------------- | :------------- | :--------------------- | :------------------------- | :--------- | :----------------------------------------------------- |
| Id             | int            | id                     | primaryKey                 | 持久化声明 | 记录标识                                               |
| UserId         | int            | user_id                | unique;not null;index      | 持久化声明 | 所属用户标识                                           |
| Secret         | string         | -                      | type:varchar(255);not null | 持久化声明 | TOTP密钥，不返回给前端                                 |
| IsEnabled      | bool           | is_enabled             | 未显式声明                 | 持久化声明 | 该实体的 IsEnabled 属性；精确约束见声明与业务说明      |
| FailedAttempts | int            | failed_attempts        | default:0                  | 持久化声明 | 该实体的 FailedAttempts 属性；精确约束见声明与业务说明 |
| LockedUntil    | \*time.Time    | locked_until,omitempty | 未显式声明                 | 持久化声明 | 该实体的 LockedUntil 属性；精确约束见声明与业务说明    |
| LastUsedAt     | \*time.Time    | last_used_at,omitempty | 未显式声明                 | 持久化声明 | 该实体的 LastUsedAt 属性；精确约束见声明与业务说明     |
| CreatedAt      | time.Time      | created_at             | 未显式声明                 | 持久化声明 | 创建时间；精确单位看对应代码                           |
| UpdatedAt      | time.Time      | updated_at             | 未显式声明                 | 持久化声明 | 更新时间                                               |
| DeletedAt      | gorm.DeletedAt | -                      | index                      | 持久化声明 | 软删除标记，不是业务状态                               |

---

### 1.25 TwoFABackupCode：two_fa_backup_codes

来源：[[new-api-ref--model--twofa.go.txt]] 第 28 行。表名依据：ORM 命名参考，未运行迁移核验。

| Go 字段   | Go 类型        | JSON 键           | GORM 声明                  | 映射       | 注释或语义提示                                 |
| :-------- | :------------- | :---------------- | :------------------------- | :--------- | :--------------------------------------------- |
| Id        | int            | id                | primaryKey                 | 持久化声明 | 记录标识                                       |
| UserId    | int            | user_id           | not null;index             | 持久化声明 | 所属用户标识                                   |
| CodeHash  | string         | -                 | type:varchar(255);not null | 持久化声明 | 备用码哈希                                     |
| IsUsed    | bool           | is_used           | 未显式声明                 | 持久化声明 | 该实体的 IsUsed 属性；精确约束见声明与业务说明 |
| UsedAt    | \*time.Time    | used_at,omitempty | 未显式声明                 | 持久化声明 | 该实体的 UsedAt 属性；精确约束见声明与业务说明 |
| CreatedAt | time.Time      | created_at        | 未显式声明                 | 持久化声明 | 创建时间；精确单位看对应代码                   |
| DeletedAt | gorm.DeletedAt | -                 | index                      | 持久化声明 | 软删除标记，不是业务状态                       |

---

### 1.26 Checkin：checkins

来源：[[new-api-ref--model--checkin.go.txt]] 第 13 行。表名依据：显式 TableName。

| Go 字段      | Go 类型 | JSON 键       | GORM 声明                                                   | 映射       | 注释或语义提示                                       |
| :----------- | :------ | :------------ | :---------------------------------------------------------- | :--------- | :--------------------------------------------------- |
| Id           | int     | id            | primaryKey;autoIncrement                                    | 持久化声明 | 记录标识                                             |
| UserId       | int     | user_id       | not null;uniqueIndex:idx_user_checkin_date                  | 持久化声明 | 所属用户标识                                         |
| CheckinDate  | string  | checkin_date  | type:varchar(10);not null;uniqueIndex:idx_user_checkin_date | 持久化声明 | 格式: YYYY-MM-DD                                     |
| QuotaAwarded | int     | quota_awarded | not null                                                    | 持久化声明 | 该实体的 QuotaAwarded 属性；精确约束见声明与业务说明 |
| CreatedAt    | int64   | created_at    | bigint                                                      | 持久化声明 | 创建时间；精确单位看对应代码                         |

---

### 1.27 SubscriptionOrder：subscription_orders

来源：[[new-api-ref--model--subscription.go.txt]] 第 214 行。表名依据：ORM 命名参考，未运行迁移核验。

| Go 字段         | Go 类型 | JSON 键          | GORM 声明                      | 映射       | 注释或语义提示                                          |
| :-------------- | :------ | :--------------- | :----------------------------- | :--------- | :------------------------------------------------------ |
| Id              | int     | id               | 未显式声明                     | 持久化声明 | 记录标识                                                |
| UserId          | int     | user_id          | index                          | 持久化声明 | 所属用户标识                                            |
| PlanId          | int     | plan_id          | index                          | 持久化声明 | 订阅方案标识                                            |
| Money           | float64 | money            | 未显式声明                     | 持久化声明 | 支付金额相关字段，结合币种与控制器解释                  |
| TradeNo         | string  | trade_no         | unique;type:varchar(255);index | 持久化声明 | 支付业务单号                                            |
| PaymentMethod   | string  | payment_method   | type:varchar(50)               | 持久化声明 | 该实体的 PaymentMethod 属性；精确约束见声明与业务说明   |
| PaymentProvider | string  | payment_provider | type:varchar(50);default:''    | 持久化声明 | 该实体的 PaymentProvider 属性；精确约束见声明与业务说明 |
| Status          | string  | status           | 未显式声明                     | 持久化声明 | 状态，枚举定义按所属实体解释                            |
| CreateTime      | int64   | create_time      | 未显式声明                     | 持久化声明 | 该实体的 CreateTime 属性；精确约束见声明与业务说明      |
| CompleteTime    | int64   | complete_time    | 未显式声明                     | 持久化声明 | 该实体的 CompleteTime 属性；精确约束见声明与业务说明    |
| ProviderPayload | string  | provider_payload | type:text                      | 持久化声明 | 该实体的 ProviderPayload 属性；精确约束见声明与业务说明 |

---

### 1.28 UserSubscription：user_subscriptions

来源：[[new-api-ref--model--subscription.go.txt]] 第 253 行。表名依据：ORM 命名参考，未运行迁移核验。

| Go 字段             | Go 类型 | JSON 键               | GORM 声明                                                   | 映射       | 注释或语义提示                                                                                       |
| :------------------ | :------ | :-------------------- | :---------------------------------------------------------- | :--------- | :--------------------------------------------------------------------------------------------------- |
| Id                  | int     | id                    | 未显式声明                                                  | 持久化声明 | 记录标识                                                                                             |
| UserId              | int     | user_id               | index;index:idx_user_sub_active,priority:1                  | 持久化声明 | 所属用户标识                                                                                         |
| PlanId              | int     | plan_id               | index                                                       | 持久化声明 | 订阅方案标识                                                                                         |
| AmountTotal         | int64   | amount_total          | type:bigint;not null;default:0                              | 持久化声明 | 周期总额度                                                                                           |
| AmountUsed          | int64   | amount_used           | type:bigint;not null;default:0                              | 持久化声明 | 周期已用额度                                                                                         |
| StartTime           | int64   | start_time            | bigint                                                      | 持久化声明 | 该实体的 StartTime 属性；精确约束见声明与业务说明                                                    |
| EndTime             | int64   | end_time              | bigint;index;index:idx_user_sub_active,priority:3           | 持久化声明 | 该实体的 EndTime 属性；精确约束见声明与业务说明                                                      |
| Status              | string  | status                | type:varchar(32);index;index:idx_user_sub_active,priority:2 | 持久化声明 | active/expired/cancelled                                                                             |
| Source              | string  | source                | type:varchar(32);default:'order'                            | 持久化声明 | order/admin                                                                                          |
| LastResetTime       | int64   | last_reset_time       | type:bigint;default:0                                       | 持久化声明 | 该实体的 LastResetTime 属性；精确约束见声明与业务说明                                                |
| NextResetTime       | int64   | next_reset_time       | type:bigint;default:0;index                                 | 持久化声明 | 该实体的 NextResetTime 属性；精确约束见声明与业务说明                                                |
| UpgradeGroup        | string  | upgrade_group         | type:varchar(64);default:''                                 | 持久化声明 | 该实体的 UpgradeGroup 属性；精确约束见声明与业务说明                                                 |
| PrevUserGroup       | string  | prev_user_group       | type:varchar(64);default:''                                 | 持久化声明 | 该实体的 PrevUserGroup 属性；精确约束见声明与业务说明                                                |
| DowngradeGroup      | string  | downgrade_group       | type:varchar(64);default:''                                 | 持久化声明 | Downgrade target group on expiry (snapshot from plan; empty = revert to PrevUserGroup)               |
| AllowWalletOverflow | bool    | allow_wallet_overflow | 未显式声明                                                  | 持久化声明 | Whether wallet fallback is allowed after this subscription's quota is exhausted (snapshot from plan) |
| CreatedAt           | int64   | created_at            | bigint                                                      | 持久化声明 | 创建时间；精确单位看对应代码                                                                         |
| UpdatedAt           | int64   | updated_at            | bigint                                                      | 持久化声明 | 更新时间                                                                                             |

---

### 1.29 SubscriptionPreConsumeRecord：subscription_pre_consume_records

来源：[[new-api-ref--model--subscription.go.txt]] 第 1244 行。表名依据：ORM 命名参考，未运行迁移核验。

| Go 字段            | Go 类型 | JSON 键              | GORM 声明                      | 映射       | 注释或语义提示                                             |
| :----------------- | :------ | :------------------- | :----------------------------- | :--------- | :--------------------------------------------------------- |
| Id                 | int     | id                   | 未显式声明                     | 持久化声明 | 记录标识                                                   |
| RequestId          | string  | request_id           | type:varchar(64);uniqueIndex   | 持久化声明 | 请求标识                                                   |
| UserId             | int     | user_id              | index                          | 持久化声明 | 所属用户标识                                               |
| UserSubscriptionId | int     | user_subscription_id | index                          | 持久化声明 | 该实体的 UserSubscriptionId 属性；精确约束见声明与业务说明 |
| PreConsumed        | int64   | pre_consumed         | type:bigint;not null;default:0 | 持久化声明 | 该实体的 PreConsumed 属性；精确约束见声明与业务说明        |
| Status             | string  | status               | type:varchar(32);index         | 持久化声明 | consumed/refunded                                          |
| CreatedAt          | int64   | created_at           | bigint                         | 持久化声明 | 创建时间；精确单位看对应代码                               |
| UpdatedAt          | int64   | updated_at           | bigint;index                   | 持久化声明 | 更新时间                                                   |

---

### 1.30 CustomOAuthProvider：custom_oauth_providers

来源：[[new-api-ref--model--custom_oauth_provider.go.txt]] 第 40 行。表名依据：显式 TableName。

| Go 字段               | Go 类型   | JSON 键                | GORM 声明                                        | 映射       | 注释或语义提示                                                                                                  |
| :-------------------- | :-------- | :--------------------- | :----------------------------------------------- | :--------- | :-------------------------------------------------------------------------------------------------------------- |
| Id                    | int       | id                     | primaryKey                                       | 持久化声明 | 记录标识                                                                                                        |
| Name                  | string    | name                   | type:varchar(64);not null                        | 持久化声明 | Display name, e.g., "GitHub Enterprise"                                                                         |
| Slug                  | string    | slug                   | type:varchar(64);uniqueIndex;not null            | 持久化声明 | URL identifier, e.g., "github-enterprise"                                                                       |
| Icon                  | string    | icon                   | type:varchar(128);default:''                     | 持久化声明 | Icon name from @lobehub/icons                                                                                   |
| Enabled               | bool      | enabled                | default:false                                    | 持久化声明 | Whether this provider is enabled                                                                                |
| ClientId              | string    | client_id              | type:varchar(256)                                | 持久化声明 | OAuth client ID                                                                                                 |
| ClientSecret          | string    | -                      | type:varchar(512)                                | 持久化声明 | OAuth client secret (not returned to frontend)                                                                  |
| AuthorizationEndpoint | string    | authorization_endpoint | type:varchar(512)                                | 持久化声明 | Authorization URL                                                                                               |
| TokenEndpoint         | string    | token_endpoint         | type:varchar(512)                                | 持久化声明 | Token exchange URL                                                                                              |
| UserInfoEndpoint      | string    | user_info_endpoint     | type:varchar(512)                                | 持久化声明 | User info URL                                                                                                   |
| Scopes                | string    | scopes                 | type:varchar(256);default:'openid profile email' | 持久化声明 | OAuth scopes                                                                                                    |
| UserIdField           | string    | user_id_field          | type:varchar(128);default:'sub'                  | 持久化声明 | Field mapping configuration (supports JSONPath via gjson) User ID field path, e.g., "sub", "id", "data.user.id" |
| UsernameField         | string    | username_field         | type:varchar(128);default:'preferred_username'   | 持久化声明 | Username field path                                                                                             |
| DisplayNameField      | string    | display_name_field     | type:varchar(128);default:'name'                 | 持久化声明 | Display name field path                                                                                         |
| EmailField            | string    | email_field            | type:varchar(128);default:'email'                | 持久化声明 | Email field path                                                                                                |
| WellKnown             | string    | well_known             | type:varchar(512)                                | 持久化声明 | Advanced options OIDC discovery endpoint (optional)                                                             |
| AuthStyle             | int       | auth_style             | default:0                                        | 持久化声明 | 0=auto, 1=params, 2=header (Basic Auth)                                                                         |
| AccessPolicy          | string    | access_policy          | type:text                                        | 持久化声明 | JSON policy for access control based on user info                                                               |
| AccessDeniedMessage   | string    | access_denied_message  | type:varchar(512)                                | 持久化声明 | Custom error message template when access is denied                                                             |
| CreatedAt             | time.Time | created_at             | 未显式声明                                       | 持久化声明 | 创建时间；精确单位看对应代码                                                                                    |
| UpdatedAt             | time.Time | updated_at             | 未显式声明                                       | 持久化声明 | 更新时间                                                                                                        |

---

### 1.31 UserOAuthBinding：user_oauth_bindings

来源：[[new-api-ref--model--user_oauth_binding.go.txt]] 第 11 行。表名依据：显式 TableName。

| Go 字段        | Go 类型   | JSON 键          | GORM 声明                                                            | 映射       | 注释或语义提示                                               |
| :------------- | :-------- | :--------------- | :------------------------------------------------------------------- | :--------- | :----------------------------------------------------------- |
| Id             | int       | id               | primaryKey                                                           | 持久化声明 | 记录标识                                                     |
| UserId         | int       | user_id          | not null;uniqueIndex:ux_user_provider                                | 持久化声明 | User ID - one binding per user per provider                  |
| ProviderId     | int       | provider_id      | not null;uniqueIndex:ux_user_provider;uniqueIndex:ux_provider_userid | 持久化声明 | Custom OAuth provider ID                                     |
| ProviderUserId | string    | provider_user_id | type:varchar(256);not null;uniqueIndex:ux_provider_userid            | 持久化声明 | User ID from OAuth provider - one OAuth account per provider |
| CreatedAt      | time.Time | created_at       | 未显式声明                                                           | 持久化声明 | 创建时间；精确单位看对应代码                                 |

---

### 1.32 PerfMetric：perf_metrics

来源：[[new-api-ref--model--perf_metric.go.txt]] 第 11 行。表名依据：显式 TableName。

| Go 字段        | Go 类型 | JSON 键    | GORM 声明                                                                   | 映射       | 注释或语义提示                                         |
| :------------- | :------ | :--------- | :-------------------------------------------------------------------------- | :--------- | :----------------------------------------------------- |
| Id             | int     | id         | primaryKey                                                                  | 持久化声明 | 记录标识                                               |
| ModelName      | string  | model_name | size:128;uniqueIndex:idx_perf_model_group_bucket,priority:1                 | 持久化声明 | 模型标识                                               |
| Group          | string  | group      | column:group;size:64;uniqueIndex:idx_perf_model_group_bucket,priority:2     | 持久化声明 | 业务分组                                               |
| BucketTs       | int64   | bucket_ts  | uniqueIndex:idx_perf_model_group_bucket,priority:3;index:idx_perf_bucket_ts | 持久化声明 | 该实体的 BucketTs 属性；精确约束见声明与业务说明       |
| RequestCount   | int64   | -          | default:0                                                                   | 持久化声明 | 该实体的 RequestCount 属性；精确约束见声明与业务说明   |
| SuccessCount   | int64   | -          | default:0                                                                   | 持久化声明 | 该实体的 SuccessCount 属性；精确约束见声明与业务说明   |
| TotalLatencyMs | int64   | -          | default:0                                                                   | 持久化声明 | 该实体的 TotalLatencyMs 属性；精确约束见声明与业务说明 |
| TtftSumMs      | int64   | -          | default:0                                                                   | 持久化声明 | 该实体的 TtftSumMs 属性；精确约束见声明与业务说明      |
| TtftCount      | int64   | -          | default:0                                                                   | 持久化声明 | 该实体的 TtftCount 属性；精确约束见声明与业务说明      |
| OutputTokens   | int64   | -          | default:0                                                                   | 持久化声明 | 该实体的 OutputTokens 属性；精确约束见声明与业务说明   |
| GenerationMs   | int64   | -          | default:0                                                                   | 持久化声明 | 该实体的 GenerationMs 属性；精确约束见声明与业务说明   |

---

### 1.33 SystemInstance：system_instances

来源：[[new-api-ref--model--system_instance.go.txt]] 第 17 行。表名依据：ORM 命名参考，未运行迁移核验。

| Go 字段    | Go 类型 | JSON 键      | GORM 声明                    | 映射       | 注释或语义提示                                     |
| :--------- | :------ | :----------- | :--------------------------- | :--------- | :------------------------------------------------- |
| NodeName   | string  | node_name    | type:varchar(128);primaryKey | 持久化声明 | 该实体的 NodeName 属性；精确约束见声明与业务说明   |
| Info       | string  | info         | type:text                    | 持久化声明 | 该实体的 Info 属性；精确约束见声明与业务说明       |
| StartedAt  | int64   | started_at   | bigint;index                 | 持久化声明 | 该实体的 StartedAt 属性；精确约束见声明与业务说明  |
| LastSeenAt | int64   | last_seen_at | bigint;index                 | 持久化声明 | 该实体的 LastSeenAt 属性；精确约束见声明与业务说明 |
| CreatedAt  | int64   | created_at   | bigint;index                 | 持久化声明 | 创建时间；精确单位看对应代码                       |
| UpdatedAt  | int64   | updated_at   | bigint;index                 | 持久化声明 | 更新时间                                           |

---

### 1.34 SystemTask：system_tasks

来源：[[new-api-ref--model--system_task.go.txt]] 第 28 行。表名依据：ORM 命名参考，未运行迁移核验。

| Go 字段   | Go 类型          | JSON 键              | GORM 声明                    | 映射       | 注释或语义提示                                    |
| :-------- | :--------------- | :------------------- | :--------------------------- | :--------- | :------------------------------------------------ |
| ID        | int64            | id                   | primary_key                  | 持久化声明 | 记录标识                                          |
| TaskID    | string           | task_id              | type:varchar(64);uniqueIndex | 持久化声明 | 该实体的 TaskID 属性；精确约束见声明与业务说明    |
| Type      | string           | type                 | type:varchar(64);index       | 持久化声明 | 类型标识                                          |
| Status    | SystemTaskStatus | status               | type:varchar(32);index       | 持久化声明 | 状态，枚举定义按所属实体解释                      |
| ActiveKey | \*string         | active_key,omitempty | type:varchar(64);uniqueIndex | 持久化声明 | 该实体的 ActiveKey 属性；精确约束见声明与业务说明 |
| Payload   | string           | payload              | type:text                    | 持久化声明 | 该实体的 Payload 属性；精确约束见声明与业务说明   |
| State     | string           | state                | type:text                    | 持久化声明 | 该实体的 State 属性；精确约束见声明与业务说明     |
| Result    | string           | result               | type:text                    | 持久化声明 | 该实体的 Result 属性；精确约束见声明与业务说明    |
| Error     | string           | error                | type:text                    | 持久化声明 | 该实体的 Error 属性；精确约束见声明与业务说明     |
| LockedBy  | string           | locked_by            | type:varchar(128);index      | 持久化声明 | 该实体的 LockedBy 属性；精确约束见声明与业务说明  |
| CreatedAt | int64            | created_at           | bigint;index                 | 持久化声明 | 创建时间；精确单位看对应代码                      |
| UpdatedAt | int64            | updated_at           | bigint;index                 | 持久化声明 | 更新时间                                          |

---

### 1.35 SystemTaskLock：system_task_locks

来源：[[new-api-ref--model--system_task.go.txt]] 第 43 行。表名依据：ORM 命名参考，未运行迁移核验。

| Go 字段     | Go 类型 | JSON 键      | GORM 声明                   | 映射       | 注释或语义提示                                      |
| :---------- | :------ | :----------- | :-------------------------- | :--------- | :-------------------------------------------------- |
| Type        | string  | type         | type:varchar(64);primaryKey | 持久化声明 | 类型标识                                            |
| TaskID      | string  | task_id      | type:varchar(64);index      | 持久化声明 | 该实体的 TaskID 属性；精确约束见声明与业务说明      |
| LockedBy    | string  | locked_by    | type:varchar(128);index     | 持久化声明 | 该实体的 LockedBy 属性；精确约束见声明与业务说明    |
| LockedUntil | int64   | locked_until | bigint;index                | 持久化声明 | 该实体的 LockedUntil 属性；精确约束见声明与业务说明 |
| UpdatedAt   | int64   | updated_at   | bigint;index                | 持久化声明 | 更新时间                                            |

---

### 1.36 CasbinRule：casbin_rule

来源：[[new-api-ref--model--casbin_rule.go.txt]] 第 3 行。表名依据：显式 TableName。

| Go 字段 | Go 类型 | JSON 键  | GORM 声明                                                                               | 映射       | 注释或语义提示                                |
| :------ | :------ | :------- | :-------------------------------------------------------------------------------------- | :--------- | :-------------------------------------------- |
| Id      | uint    | (未声明) | primaryKey;autoIncrement                                                                | 持久化声明 | 记录标识                                      |
| Ptype   | string  | (未声明) | size:100;index:idx_casbin_rule,priority:1;uniqueIndex:idx_casbin_rule_unique,priority:1 | 持久化声明 | 该实体的 Ptype 属性；精确约束见声明与业务说明 |
| V0      | string  | (未声明) | size:100;index:idx_casbin_rule,priority:2;uniqueIndex:idx_casbin_rule_unique,priority:2 | 持久化声明 | 该实体的 V0 属性；精确约束见声明与业务说明    |
| V1      | string  | (未声明) | size:100;index:idx_casbin_rule,priority:3;uniqueIndex:idx_casbin_rule_unique,priority:3 | 持久化声明 | 该实体的 V1 属性；精确约束见声明与业务说明    |
| V2      | string  | (未声明) | size:100;index:idx_casbin_rule,priority:4;uniqueIndex:idx_casbin_rule_unique,priority:4 | 持久化声明 | 该实体的 V2 属性；精确约束见声明与业务说明    |
| V3      | string  | (未声明) | size:100;index:idx_casbin_rule,priority:5;uniqueIndex:idx_casbin_rule_unique,priority:5 | 持久化声明 | 该实体的 V3 属性；精确约束见声明与业务说明    |
| V4      | string  | (未声明) | size:100;index:idx_casbin_rule,priority:6;uniqueIndex:idx_casbin_rule_unique,priority:6 | 持久化声明 | 该实体的 V4 属性；精确约束见声明与业务说明    |
| V5      | string  | (未声明) | size:100;index:idx_casbin_rule,priority:7;uniqueIndex:idx_casbin_rule_unique,priority:7 | 持久化声明 | 该实体的 V5 属性；精确约束见声明与业务说明    |

---

### 1.37 AuthzRole：authz_roles

来源：[[new-api-ref--model--authz_role.go.txt]] 第 3 行。表名依据：显式 TableName。

| Go 字段     | Go 类型 | JSON 键     | GORM 声明                        | 映射       | 注释或语义提示                                      |
| :---------- | :------ | :---------- | :------------------------------- | :--------- | :-------------------------------------------------- |
| Id          | uint    | id          | primaryKey;autoIncrement         | 持久化声明 | 记录标识                                            |
| Key         | string  | key         | size:64;uniqueIndex;not null     | 持久化声明 | 键值或凭据，含义取决于所属实体                      |
| Name        | string  | name        | size:100;not null                | 持久化声明 | 名称                                                |
| Description | string  | description | type:text                        | 持久化声明 | 该实体的 Description 属性；精确约束见声明与业务说明 |
| BuiltIn     | bool    | built_in    | 未显式声明                       | 持久化声明 | 该实体的 BuiltIn 属性；精确约束见声明与业务说明     |
| Enabled     | bool    | enabled     | 未显式声明                       | 持久化声明 | 启用标记                                            |
| Sort        | int     | sort        | 未显式声明                       | 持久化声明 | 该实体的 Sort 属性；精确约束见声明与业务说明        |
| CreatedAt   | int64   | created_at  | autoCreateTime;column:created_at | 持久化声明 | 创建时间；精确单位看对应代码                        |
| UpdatedAt   | int64   | updated_at  | autoUpdateTime;column:updated_at | 持久化声明 | 更新时间                                            |

---

### 1.38 UserAccessToken：user_access_tokens

来源：[[new-api-ref--model--user_access_token.go.txt]] 第 41 行。表名依据：显式 TableName。

| Go 字段    | Go 类型 | JSON 键      | GORM 声明                    | 映射       | 注释或语义提示                                     |
| :--------- | :------ | :----------- | :--------------------------- | :--------- | :------------------------------------------------- |
| Id         | int     | id           | 未显式声明                   | 持久化声明 | 记录标识                                           |
| UserId     | int     | -            | index                        | 持久化声明 | 所属用户标识                                       |
| Name       | string  | name         | type:varchar(64)             | 持久化声明 | 名称                                               |
| TokenHash  | string  | token_ref    | type:varchar(64);uniqueIndex | 持久化声明 | 个人访问令牌指纹/散列                              |
| TokenHint  | string  | token_hint   | type:varchar(8)              | 持久化声明 | 该实体的 TokenHint 属性；精确约束见声明与业务说明  |
| Scopes     | string  | -            | type:varchar(2048)           | 持久化声明 | 该实体的 Scopes 属性；精确约束见声明与业务说明     |
| ExpiresAt  | int64   | expires_at   | type:bigint;index            | 持久化声明 | 到期时间                                           |
| LastUsedAt | int64   | last_used_at | type:bigint                  | 持久化声明 | 该实体的 LastUsedAt 属性；精确约束见声明与业务说明 |
| LastUsedIp | string  | last_used_ip | type:varchar(64)             | 持久化声明 | 该实体的 LastUsedIp 属性；精确约束见声明与业务说明 |
| CreatedAt  | int64   | created_at   | type:bigint                  | 持久化声明 | 创建时间；精确单位看对应代码                       |

---

### 1.39 SubscriptionPlan：subscription_plans

来源：[[new-api-ref--model--subscription.go.txt]] 第 146 行。表名依据：ORM 命名参考，未运行迁移核验。

| Go 字段                 | Go 类型 | JSON 键                    | GORM 声明                                 | 映射       | 注释或语义提示                                                                            |
| :---------------------- | :------ | :------------------------- | :---------------------------------------- | :--------- | :---------------------------------------------------------------------------------------- |
| Id                      | int     | id                         | 未显式声明                                | 持久化声明 | 记录标识                                                                                  |
| Title                   | string  | title                      | type:varchar(128);not null                | 持久化声明 | 该实体的 Title 属性；精确约束见声明与业务说明                                             |
| Subtitle                | string  | subtitle                   | type:varchar(255);default:''              | 持久化声明 | 该实体的 Subtitle 属性；精确约束见声明与业务说明                                          |
| PriceAmount             | float64 | price_amount               | type:decimal(10,6);not null;default:0     | 持久化声明 | Display money amount (follow existing code style: float64 for money)                      |
| Currency                | string  | currency                   | type:varchar(8);not null;default:'USD'    | 持久化声明 | 该实体的 Currency 属性；精确约束见声明与业务说明                                          |
| DurationUnit            | string  | duration_unit              | type:varchar(16);not null;default:'month' | 持久化声明 | 该实体的 DurationUnit 属性；精确约束见声明与业务说明                                      |
| DurationValue           | int     | duration_value             | type:int;not null;default:1               | 持久化声明 | 该实体的 DurationValue 属性；精确约束见声明与业务说明                                     |
| CustomSeconds           | int64   | custom_seconds             | type:bigint;not null;default:0            | 持久化声明 | 该实体的 CustomSeconds 属性；精确约束见声明与业务说明                                     |
| Enabled                 | bool    | enabled                    | default:true                              | 持久化声明 | 启用标记                                                                                  |
| SortOrder               | int     | sort_order                 | type:int;default:0                        | 持久化声明 | 该实体的 SortOrder 属性；精确约束见声明与业务说明                                         |
| AllowBalancePay         | \*bool  | allow_balance_pay          | 未显式声明                                | 持久化声明 | 该实体的 AllowBalancePay 属性；精确约束见声明与业务说明                                   |
| AllowWalletOverflow     | \*bool  | allow_wallet_overflow      | 未显式声明                                | 持久化声明 | Allow falling back to wallet balance after subscription quota is exhausted (empty = true) |
| StripePriceId           | string  | stripe_price_id            | type:varchar(128);default:''              | 持久化声明 | 该实体的 StripePriceId 属性；精确约束见声明与业务说明                                     |
| CreemProductId          | string  | creem_product_id           | type:varchar(128);default:''              | 持久化声明 | 该实体的 CreemProductId 属性；精确约束见声明与业务说明                                    |
| WaffoPancakeProductId   | string  | waffo_pancake_product_id   | type:varchar(128);default:''              | 持久化声明 | 该实体的 WaffoPancakeProductId 属性；精确约束见声明与业务说明                             |
| MaxPurchasePerUser      | int     | max_purchase_per_user      | type:int;default:0                        | 持久化声明 | Max purchases per user (0 = unlimited)                                                    |
| UpgradeGroup            | string  | upgrade_group              | type:varchar(64);default:''               | 持久化声明 | Upgrade user group after purchase (empty = no change)                                     |
| DowngradeGroup          | string  | downgrade_group            | type:varchar(64);default:''               | 持久化声明 | Downgrade user group on expiry (empty = revert to the group held before purchase)         |
| TotalAmount             | int64   | total_amount               | type:bigint;not null;default:0            | 持久化声明 | Total quota (amount in quota units, 0 = unlimited)                                        |
| QuotaResetPeriod        | string  | quota_reset_period         | type:varchar(16);default:'never'          | 持久化声明 | Quota reset period for plan                                                               |
| QuotaResetCustomSeconds | int64   | quota_reset_custom_seconds | type:bigint;default:0                     | 持久化声明 | 该实体的 QuotaResetCustomSeconds 属性；精确约束见声明与业务说明                           |
| CreatedAt               | int64   | created_at                 | bigint                                    | 持久化声明 | 创建时间；精确单位看对应代码                                                              |
| UpdatedAt               | int64   | updated_at                 | bigint                                    | 持久化声明 | 更新时间                                                                                  |

---

### 1.40 AuditLog：audit_logs

来源：[[new-api-ref--model--audit_log.go.txt]] 第 26 行。表名依据：ORM 命名参考，未运行迁移核验。

| Go 字段    | Go 类型    | JSON 键     | GORM 声明                                                                                                                          | 映射       | 注释或语义提示                                                       |
| :--------- | :--------- | :---------- | :--------------------------------------------------------------------------------------------------------------------------------- | :--------- | :------------------------------------------------------------------- |
| Id         | int        | id          | 未显式声明                                                                                                                         | 持久化声明 | 记录标识                                                             |
| EventId    | string     | event_id    | type:varchar(64);uniqueIndex;index:idx_audit_time_event,priority:2                                                                 | 持久化声明 | 该实体的 EventId 属性；精确约束见声明与业务说明                      |
| UserId     | int        | user_id     | index:idx_audit_user_time,priority:1                                                                                               | 持久化声明 | 所属用户标识                                                         |
| Username   | string     | username    | type:varchar(64);index                                                                                                             | 持久化声明 | 用户名                                                               |
| ActorRole  | int        | actor_role  | 未显式声明                                                                                                                         | 持久化声明 | Immutable role of the actor when the event began, not the log owner. |
| CreatedAt  | int64      | created_at  | type:bigint;index:idx_audit_user_time,priority:2;index:idx_audit_token_time,priority:2;index;index:idx_audit_time_event,priority:1 | 持久化声明 | 创建时间；精确单位看对应代码                                         |
| Category   | string     | category    | type:varchar(24);index                                                                                                             | 持久化声明 | 该实体的 Category 属性；精确约束见声明与业务说明                     |
| Action     | string     | action      | type:varchar(128)                                                                                                                  | 持久化声明 | 该实体的 Action 属性；精确约束见声明与业务说明                       |
| TokenRef   | string     | token_ref   | type:varchar(64);index:idx_audit_token_time,priority:1                                                                             | 持久化声明 | 该实体的 TokenRef 属性；精确约束见声明与业务说明                     |
| AuthMethod | string     | auth_method | type:varchar(24)                                                                                                                   | 持久化声明 | 该实体的 AuthMethod 属性；精确约束见声明与业务说明                   |
| Ip         | string     | ip          | type:varchar(64)                                                                                                                   | 持久化声明 | 该实体的 Ip 属性；精确约束见声明与业务说明                           |
| UserAgent  | string     | user_agent  | type:varchar(512)                                                                                                                  | 持久化声明 | 该实体的 UserAgent 属性；精确约束见声明与业务说明                    |
| Method     | string     | method      | type:varchar(16)                                                                                                                   | 持久化声明 | 该实体的 Method 属性；精确约束见声明与业务说明                       |
| Route      | string     | route       | type:varchar(255)                                                                                                                  | 持久化声明 | 该实体的 Route 属性；精确约束见声明与业务说明                        |
| Status     | int        | status      | 未显式声明                                                                                                                         | 持久化声明 | 状态，枚举定义按所属实体解释                                         |
| Success    | bool       | success     | 未显式声明                                                                                                                         | 持久化声明 | 该实体的 Success 属性；精确约束见声明与业务说明                      |
| RequestId  | string     | request_id  | type:varchar(64);index                                                                                                             | 持久化声明 | 请求标识                                                             |
| Content    | string     | content     | type:text                                                                                                                          | 持久化声明 | 该实体的 Content 属性；精确约束见声明与业务说明                      |
| Other      | AuditOther | other       | type:json                                                                                                                          | 持久化声明 | 扩展信息                                                             |

---

### 1.41 嵌套对象原始定义

以下结构属于 JSON/运行时上下文，不在上述独立表清单中。读不懂 Go 类型时按本页开头的 Python 类比看即可。

#### 1.41.1 ChannelInfo

来源：[[new-api-ref--model--channel.go.txt]] 第 64 行。

```go
type ChannelInfo struct {
	IsMultiKey             bool                  `json:"is_multi_key"`                        // 是否多Key模式
	MultiKeySize           int                   `json:"multi_key_size"`                      // 多Key模式下的Key数量
	MultiKeyStatusList     map[int]int           `json:"multi_key_status_list"`               // key状态列表，key index -> status
	MultiKeyDisabledReason map[int]string        `json:"multi_key_disabled_reason,omitempty"` // key禁用原因列表，key index -> reason
	MultiKeyDisabledTime   map[int]int64         `json:"multi_key_disabled_time,omitempty"`   // key禁用时间列表，key index -> time
	MultiKeyPollingIndex   int                   `json:"multi_key_polling_index"`             // 多Key模式下轮询的key索引
	MultiKeyMode           constant.MultiKeyMode `json:"multi_key_mode"`
}
```

#### 1.41.2 Properties

来源：[[new-api-ref--model--task.go.txt]] 第 83 行。

```go
type Properties struct {
	Input             string `json:"input"`
	UpstreamModelName string `json:"upstream_model_name,omitempty"`
	OriginModelName   string `json:"origin_model_name,omitempty"`
}
```

#### 1.41.3 TaskPrivateData

来源：[[new-api-ref--model--task.go.txt]] 第 111 行。

```go
type TaskPrivateData struct {
	Key            string `json:"key,omitempty"`
	UpstreamTaskID string `json:"upstream_task_id,omitempty"` // 上游真实 task ID
	ResultURL      string `json:"result_url,omitempty"`       // 任务成功后的结果 URL（视频地址等）
	// Execution records safe, immutable request provenance. It lives next to
	// other private task state so public task DTOs cannot expose it by accident.
	Execution *TaskExecutionSnapshot `json:"execution,omitempty"`
	// 计费上下文：用于异步退款/差额结算（轮询阶段读取）
	BillingSource  string              `json:"billing_source,omitempty"`  // "wallet" 或 "subscription"
	SubscriptionId int                 `json:"subscription_id,omitempty"` // 订阅 ID，用于订阅退款
	TokenId        int                 `json:"token_id,omitempty"`        // 令牌 ID，用于令牌额度退款
	NodeName       string              `json:"node_name,omitempty"`       // 发起任务的节点名，轮询结算阶段据此归属日志而非最后查询节点
	BillingContext *TaskBillingContext `json:"billing_context,omitempty"` // 计费参数快照（用于轮询阶段重新计算）
	// ResponsesBackground records that the openai_responses create request
	// asked for background:true. Every task is durable and survives client
	// disconnect regardless; this only echoes the protocol-level request
	// attribute back on retrieval snapshots.
	ResponsesBackground bool `json:"responses_background,omitempty"`
	// PluginState is plugin-owned cross-round data. Unlike Task.Data it is
	// only replaced when a hook explicitly returns state.
	PluginState json.RawMessage `json:"plugin_state,omitempty"`
	// PollFailures counts consecutive unrecognized or transient poll outcomes.
	PollFailures int `json:"poll_failures,omitempty"`
	// ResultDiscarded marks an immediate terminal result whose submit route
	// declared retainResult: false. The upstream snapshot was never written
	// and every retrieval surface treats the task as not found. The zero
	// value keeps historical rows retained and retrievable.
	ResultDiscarded bool `json:"result_discarded,omitempty"`
}
```

#### 1.41.4 TaskExecutionSnapshot

来源：[[new-api-ref--model--task.go.txt]] 第 141 行。

```go
type TaskExecutionSnapshot struct {
	RequestID   string              `json:"request_id,omitempty"`
	RequestPath string              `json:"request_path,omitempty"`
	TaskPlugin  *TaskPluginSnapshot `json:"task_plugin,omitempty"`
}
```

#### 1.41.5 TaskPluginSnapshot

来源：[[new-api-ref--model--task.go.txt]] 第 149 行。

```go
type TaskPluginSnapshot struct {
	Key        string                    `json:"key"`
	Name       string                    `json:"name"`
	Version    string                    `json:"version"`
	Author     *TaskPluginAuthorSnapshot `json:"author,omitempty"`
	APIVersion int                       `json:"api_version"`
	Generation uint64                    `json:"generation"`
}
```

#### 1.41.6 TaskPluginAuthorSnapshot

来源：[[new-api-ref--model--task.go.txt]] 第 158 行。

```go
type TaskPluginAuthorSnapshot struct {
	Name string `json:"name"`
	URL  string `json:"url,omitempty"`
}
```

#### 1.41.7 TaskBillingContext

来源：[[new-api-ref--model--task.go.txt]] 第 164 行。

```go
type TaskBillingContext struct {
	ModelPrice      float64                      `json:"model_price,omitempty"`       // 模型单价
	GroupRatio      float64                      `json:"group_ratio,omitempty"`       // 分组倍率
	ModelRatio      float64                      `json:"model_ratio,omitempty"`       // 模型倍率
	OtherRatios     map[string]float64           `json:"other_ratios,omitempty"`      // 附加倍率（时长、分辨率等）
	OriginModelName string                       `json:"origin_model_name,omitempty"` // 模型名称，必须为OriginModelName
	PerCallBilling  bool                         `json:"per_call_billing,omitempty"`  // 按次计费：跳过轮询阶段的差额结算
	TieredSnapshot  *billingexpr.BillingSnapshot `json:"tiered_snapshot,omitempty"`
}
```

#### 1.41.8 AuditOther

来源：[[new-api-ref--model--audit_other.go.txt]] 第 13 行。

```go
type AuditOther struct {
	Op          *AuditOperation   `json:"op,omitempty"`
	AdminInfo   *AuditAdminInfo   `json:"admin_info,omitempty"`
	AuditInfo   *AuditRequestInfo `json:"audit_info,omitempty"`
	RootInfo    AuditFields       `json:"root_info,omitempty"`
	LoginMethod string            `json:"login_method,omitempty"`
	UserAgent   string            `json:"user_agent,omitempty"`
}
```

#### 1.41.9 AuditOperation

来源：[[new-api-ref--model--audit_other.go.txt]] 第 22 行。

```go
type AuditOperation struct {
	Action string      `json:"action"`
	Params AuditFields `json:"params,omitempty"`
}
```

#### 1.41.10 AuditAdminInfo

来源：[[new-api-ref--model--audit_other.go.txt]] 第 27 行。

```go
type AuditAdminInfo struct {
	AdminID       int    `json:"admin_id,omitempty"`
	AdminUsername string `json:"admin_username,omitempty"`
	AdminRole     int    `json:"admin_role,omitempty"`
	AuthMethod    string `json:"auth_method,omitempty"`
}
```

#### 1.41.11 AuditRequestInfo

来源：[[new-api-ref--model--audit_other.go.txt]] 第 34 行。

```go
type AuditRequestInfo struct {
	Method  string            `json:"method"`
	Route   string            `json:"route"`
	Path    string            `json:"path"`
	Status  int               `json:"status"`
	Success bool              `json:"success"`
	Params  map[string]string `json:"params,omitempty"`
}
```

---

### 1.42 关联阅读

[[【new-api】00-总览与阅读地图]]、[[【new-api】14-离线参考入口与完整性审计]]、[[【new-api】15-数据库关系约束与建模说明]]。
