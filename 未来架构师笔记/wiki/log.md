---
author: ai
ai_editable: true
updated_by: ai
updated: 2026-08-02
---

## 1. 操作日志

> 只追加，不修改历史。每条格式：`## [YYYY-MM-DD] 操作类型 | 摘要`

### 1.1 [2026-08-02] init | 全库重构为 LLM Wiki 三层架构

- 涉及文件：`AGENTS.md`、`raw/operations-*`、`wiki/**`、`wiki/index.md`、`wiki/log.md`
- 修改内容：
  - 目录重构：全部笔记移入 `wiki/`，原始资料导入 `raw/operations-*`（6 个子项目，81 个文件）
  - 所有权规则：全部 524 篇笔记加 frontmatter（Linux/ 32 篇标 `author: ai, ai_editable: true`，其余 492 篇标 `author: human, ai_editable: false`）
  - 建立 `AGENTS.md` 规则层：所有权规则、插件边界、Ingest/Query/Lint 工作流

### 1.2 [2026-08-02] format | 全库统一 prettier 插件格式

- 涉及文件：`raw/**`、`wiki/**` 全部 `.md`、`tools/format.mjs`、`AGENTS.md`
- 修改内容：
  - 新增 `tools/format.mjs`：复刻 prettier 插件（Alvis 二次开发版）完整管线（prettier@2.8.8 + headerStartLevel=2 + autoNumbering）
  - 全库 582 个 `.md` 执行格式化：CJK 空格统一、代码块按 `semi:false/singleQuote:true` 重排、54 个文件标题自动编号/级别调整
  - `AGENTS.md` 增加强制规则：任何 AI 创建/修改的文件，完成后必须运行 `node tools/format.mjs`

### 1.3 [2026-08-02] housekeeping | 清理 .DS_Store + 图片处理规则

- 涉及文件：`.gitignore`（新增）、`AGENTS.md`、`.DS_Store`（删除 6 个）
- 修改内容：
  - 删除全库 6 个 `.DS_Store`，新增 `.gitignore` 忽略，根目录设不可变占位符防重建
  - 系统级禁用网络卷 `.DS_Store` 写入
  - `AGENTS.md` 增加 Ingest 图片处理规则：真实存在的本地图片复制进 Wiki 并嵌入，回复末尾必须列出涉及图片的文件清单，由用户用图床插件上传

### 1.4 [2026-08-02] rule | Ingest 存放位置规则

- 涉及文件：`AGENTS.md`
- 修改内容：
  - 新增 4.1 第 4 条：写页面前先对照 `wiki/index.md` 与现有目录树判断归属
  - 能归入已有主题目录（含子目录）→ 放对应目录，沿用该目录命名习惯
  - 无合适归属 → 新建符合层级与命名规则的主题目录
  - 明确存放规则：顶层=大主题中文名、子目录=细分主题、文件名同目录风格统一、不相关内容不得塞进不匹配目录
