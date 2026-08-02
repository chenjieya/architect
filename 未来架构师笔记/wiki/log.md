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
