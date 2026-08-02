---
author: ai
ai_editable: true
updated_by: ai
updated: 2026-08-02
---
# 操作日志

> 只追加，不修改历史。每条格式：`## [YYYY-MM-DD] 操作类型 | 摘要`

## [2026-08-02] init | 全库重构为 LLM Wiki 三层架构
- 涉及文件：`AGENTS.md`、`raw/operations-*`、`wiki/**`、`wiki/index.md`、`wiki/log.md`
- 修改内容：
  - 目录重构：全部笔记移入 `wiki/`，原始资料导入 `raw/operations-*`（6 个子项目，81 个文件）
  - 所有权规则：全部 524 篇笔记加 frontmatter（Linux/ 32 篇标 `author: ai, ai_editable: true`，其余 492 篇标 `author: human, ai_editable: false`）
  - 建立 `AGENTS.md` 规则层：所有权规则、插件边界、Ingest/Query/Lint 工作流
