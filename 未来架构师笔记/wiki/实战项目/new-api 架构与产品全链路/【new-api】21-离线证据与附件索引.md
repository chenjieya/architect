---
author: ai
ai_editable: true
summary: '索引源码、接口、字段与截图的固定版本附件，提供校验方法和覆盖边界。'
refs:
  pages:
    - '【new-api】00-总览与阅读地图'
    - '【new-api】14-离线参考入口与完整性审计'
    - '【new-api】16-数据库字段字典'
    - '【new-api】17-接口契约与协议边界'
    - '【new-api】19-前端页面与视觉规范'
  raw: []
updated_by: ai
updated: 2026-11-03
tags: [new-api, ModelDock, 离线参考]
source_commit: 9b473a3fe4fed8d18980fd8d3c6a8908847a5f25
---

## 1. 【new-api】21-离线证据与附件索引

> 文档遵循 md-output 规范；标题层级与编号以知识库规则和格式化脚本为准。事实依据固定为源码快照 `9b473a3fe4fed8d18980fd8d3c6a8908847a5f25`，Python 方案单独标为建议。

[TOC]

---

### 1.1 修订记录

| 编号 | 版本 |  修订人  | 修订内容               | 日期       |
| :--: | :--- | :------: | :--------------------- | :--------- |
| 001  | 1.0  | jie.chen | 补齐跨电脑离线参考资料 | 2026-11-03 |

---

### 1.2 附件的性质与定位

所有资料固定到 `9b473a3fe4fed8d18980fd8d3c6a8908847a5f25`。原项目：new-api；原组织：QuantumNous；来源仓库：https://github.com/QuantumNous/new-api 。

源码文本附件保留原始字节、署名和行号；它们不是 ModelDock 已写好的代码，也不是可编译的完整项目。保存源码证据是为了跨电脑核对边界；核心概念已经写入正文，不要求先会 Go。

[[new-api-reference-manifest.json]] 包含每个原路径、附件文件名、SHA-256、字节数和 commit。可用 `source` 字段查找原路径，用 `file` 字段读取对应文本。任何原项目文件在网页的固定版本位置都可由 `https://github.com/QuantumNous/new-api/blob/` + commit + `/` + source 构成；联网核对是可选项，不影响本地正文与附件阅读。

---

### 1.3 机器可读资料

| 附件                                     | 作用                                        |
| :--------------------------------------- | :------------------------------------------ |
| [[new-api-database-declarations.json]]   | 38 个迁移实体和嵌套类型的原始声明；不是 DDL |
| [[new-api-openapi-api.json]]             | 管理接口 OpenAPI 原文件                     |
| [[new-api-openapi-relay.json]]           | 模型接口 OpenAPI 原文件                     |
| [[new-api-openapi-operation-index.json]] | 按方法整理的 199 个文档操作                 |
| [[new-api-route-declarations.json]]      | 462 条源码路由/分组/中间件声明              |
| [[new-api-reference-manifest.json]]      | 原始来源和附件完整性清单                    |

---

### 1.4 常用源码证据入口

| 主题           | 离线证据                                                                                                                                                                                                                                                                                                                                       |
| :------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 启动与路由     | [[new-api-ref--main.go.txt]]、[[new-api-ref--router--main.go.txt]]、[[new-api-ref--router--api-router.go.txt]]、[[new-api-ref--router--relay-router.go.txt]]                                                                                                                                                                                   |
| 数据库与迁移   | [[new-api-ref--model--main.go.txt]]、[[new-api-ref--model--token_migration.go.txt]]、[[new-api-ref--model--prefill_group_migration.go.txt]]、[[new-api-ref--model--audit_log.go.txt]]                                                                                                                                                          |
| 普通请求与计费 | [[new-api-ref--controller--relay.go.txt]]、[[new-api-ref--relay--request_billing.go.txt]]、[[new-api-ref--service--billing_session.go.txt]]、[[new-api-ref--service--funding_source.go.txt]]、[[new-api-ref--common--quota_math.go.txt]]、[[new-api-ref--pkg--billingexpr--expr.md.txt]]、[[new-api-ref--.agents--rules--billing.md.txt]]      |
| 资金和任务     | [[new-api-ref--model--topup.go.txt]]、[[new-api-ref--model--subscription.go.txt]]、[[new-api-ref--model--task.go.txt]]、[[new-api-ref--service--task_billing.go.txt]]                                                                                                                                                                          |
| 插件契约       | [[new-api-ref--docs--plugin-api--v1.md.txt]]、[[new-api-ref--docs--plugin-api--v1.schema.json.txt]]、[[new-api-ref--docs--plugin-api--v1.d.ts.txt]]                                                                                                                                                                                            |
| 页面框架       | [[new-api-ref--web--src--components--layout--components--authenticated-layout.tsx.txt]]、[[new-api-ref--web--src--context--layout-provider.tsx.txt]]、[[new-api-ref--web--src--hooks--use-sidebar-data.ts.txt]]                                                                                                                                |
| 样式与组件     | [[new-api-ref--web--src--styles--theme.css.txt]]、[[new-api-ref--web--src--styles--theme-presets.css.txt]]、[[new-api-ref--web--src--styles--index.css.txt]]、[[new-api-ref--web--src--components--ui--sidebar.tsx.txt]]、[[new-api-ref--web--src--components--ui--button.tsx.txt]]、[[new-api-ref--web--src--components--ui--dialog.tsx.txt]] |
| 前后端契约     | [[new-api-ref--web--src--features--keys--api.ts.txt]]、[[new-api-ref--web--src--features--keys--types.ts.txt]]、[[new-api-ref--controller--token.go.txt]]、[[new-api-ref--web--src--lib--api.ts.txt]]                                                                                                                                          |
| 来源与署名     | [[new-api-ref--LICENSE.txt]]、[[new-api-ref--NOTICE.txt]]、[[new-api-ref--THIRD-PARTY-LICENSES.md.txt]]、[[new-api-ref--README.md.txt]]                                                                                                                                                                                                        |

---

### 1.5 证据覆盖与未保存范围

已保存原 14 篇明确链接的源码文件；额外保存 model 非测试定义/迁移、router、controller、middleware、DTO、前端路由/布局/样式、前端各 feature 的 api/types/schema 等，以及关键计费和任务实现。原文件中的 import 依赖未递归闭包，因此附件不是完整编译工程。

没有保存 Git 历史、node_modules、运行环境、真实数据库、支付/上游密钥、所有厂商适配器的全部实现、所有测试或全部多语言文本。对某个厂商的实现缺项不能根据其他厂商推断，要追加协议调研或证据。

本资料是架构和业务参考基线，不是“原软件的全部可执行规格”。完整重写仍需要新项目自己的契约、迁移、集成与故障恢复测试。

---

### 1.6 怎样检查迁移后是否齐全

1. 确认 00—21 共 22 篇在专题目录。
2. 确认同一知识库下有 `附件/new-api离线参考-9b473a3/`。
3. 打开 19 的四张图；打开 16 的字段表；用文本编辑器读取数据库 JSON 和两个 OpenAPI JSON。
4. 使用清单逐个计算附件 SHA-256，值与 `artifacts` 中一致。
5. 搜索正文中的本机 C 盘源码路径，应没有对原 checkout 的依赖。

纯 Python 校验方式如下，不需要安装依赖；参数是附件目录。它只读文件，不访问网络：

```python
from pathlib import Path
import hashlib
import json
import sys

folder = Path(sys.argv[1])
manifest = json.loads(
    (folder / "new-api-reference-manifest.json").read_text(encoding="utf-8")
)
failures = []
for item in manifest["artifacts"]:
    path = folder / item["file"]
    if not path.is_file():
        failures.append(f"missing: {item['file']}")
        continue
    digest = hashlib.sha256(path.read_bytes()).hexdigest()
    if digest != item["sha256"]:
        failures.append(f"changed: {item['file']}")
if failures:
    raise SystemExit("\n".join(failures))
print(f"verified {len(manifest['artifacts'])} artifacts")
```

上述检查只证明附件存在且未改变，不证明参考软件无漏洞或 ModelDock 已正确实现。

---

### 1.7 关联阅读

[[【new-api】00-总览与阅读地图]]、[[【new-api】14-离线参考入口与完整性审计]]、[[【new-api】16-数据库字段字典]]、[[【new-api】17-接口契约与协议边界]]、[[【new-api】19-前端页面与视觉规范]]。
