---
author: mixed
ai_editable: true
summary: "LLM Wiki 是让大模型持续维护 Markdown 知识库的思想，并可扩展为团队级生产知识系统。"
refs:
  pages: []
  raw: []
updated_by: ai
updated: 2026-08-03
---

## 1. LLM Wiki

A pattern for building personal knowledge bases using LLMs.

This is an idea file, it is designed to be copy pasted to your own LLM Agent (e.g. OpenAI Codex, Claude Code, OpenCode / Pi, or etc.). Its goal is to communicate the high level idea, but your agent will build out the specifics in collaboration with you.

### 1.1 The core idea

Most people's experience with LLMs and documents looks like RAG: you upload a collection of files, the LLM retrieves relevant chunks at query time, and generates an answer. This works, but the LLM is rediscovering knowledge from scratch on every question. There's no accumulation. Ask a subtle question that requires synthesizing five documents, and the LLM has to find and piece together the relevant fragments every time. Nothing is built up. NotebookLM, ChatGPT file uploads, and most RAG systems work this way.

The idea here is different. Instead of just retrieving from raw documents at query time, the LLM **incrementally builds and maintains a persistent wiki** — a structured, interlinked collection of markdown files that sits between you and the raw sources. When you add a new source, the LLM doesn't just index it for later retrieval. It reads it, extracts the key information, and integrates it into the existing wiki — updating entity pages, revising topic summaries, noting where new data contradicts old claims, strengthening or challenging the evolving synthesis. The knowledge is compiled once and then _kept current_, not re-derived on every query.

This is the key difference: **the wiki is a persistent, compounding artifact.** The cross-references are already there. The contradictions have already been flagged. The synthesis already reflects everything you've read. The wiki keeps getting richer with every source you add and every question you ask.

You never (or rarely) write the wiki yourself — the LLM writes and maintains all of it. You're in charge of sourcing, exploration, and asking the right questions. The LLM does all the grunt work — the summarizing, cross-referencing, filing, and bookkeeping that makes a knowledge base actually useful over time. In practice, I have the LLM agent open on one side and Obsidian open on the other. The LLM makes edits based on our conversation, and I browse the results in real time — following links, checking the graph view, reading the updated pages. Obsidian is the IDE; the LLM is the programmer; the wiki is the codebase.

This can apply to a lot of different contexts. A few examples:

- **Personal**: tracking your own goals, health, psychology, self-improvement — filing journal entries, articles, podcast notes, and building up a structured picture of yourself over time.
- **Research**: going deep on a topic over weeks or months — reading papers, articles, reports, and incrementally building a comprehensive wiki with an evolving thesis.
- **Reading a book**: filing each chapter as you go, building out pages for characters, themes, plot threads, and how they connect. By the end you have a rich companion wiki. Think of fan wikis like [Tolkien Gateway](https://tolkiengateway.net/wiki/Main_Page) — thousands of interlinked pages covering characters, places, events, languages, built by a community of volunteers over years. You could build something like that personally as you read, with the LLM doing all the cross-referencing and maintenance.
- **Business/team**: an internal wiki maintained by LLMs, fed by Slack threads, meeting transcripts, project documents, customer calls. Possibly with humans in the loop reviewing updates. The wiki stays current because the LLM does the maintenance that no one on the team wants to do.
- **Competitive analysis, due diligence, trip planning, course notes, hobby deep-dives** — anything where you're accumulating knowledge over time and want it organized rather than scattered.

### 1.2 Architecture

There are three layers:

**Raw sources** — your curated collection of source documents. Articles, papers, images, data files. These are immutable — the LLM reads from them but never modifies them. This is your source of truth.

**The wiki** — a directory of LLM-generated markdown files. Summaries, entity pages, concept pages, comparisons, an overview, a synthesis. The LLM owns this layer entirely. It creates pages, updates them when new sources arrive, maintains cross-references, and keeps everything consistent. You read it; the LLM writes it.

**The schema** — a document (e.g. CLAUDE.md for Claude Code or AGENTS.md for Codex) that tells the LLM how the wiki is structured, what the conventions are, and what workflows to follow when ingesting sources, answering questions, or maintaining the wiki. This is the key configuration file — it's what makes the LLM a disciplined wiki maintainer rather than a generic chatbot. You and the LLM co-evolve this over time as you figure out what works for your domain.

### 1.3 Operations

**Ingest.** You drop a new source into the raw collection and tell the LLM to process it. An example flow: the LLM reads the source, discusses key takeaways with you, writes a summary page in the wiki, updates the index, updates relevant entity and concept pages across the wiki, and appends an entry to the log. A single source might touch 10-15 wiki pages. Personally I prefer to ingest sources one at a time and stay involved — I read the summaries, check the updates, and guide the LLM on what to emphasize. But you could also batch-ingest many sources at once with less supervision. It's up to you to develop the workflow that fits your style and document it in the schema for future sessions.

**Query.** You ask questions against the wiki. The LLM searches for relevant pages, reads them, and synthesizes an answer with citations. Answers can take different forms depending on the question — a markdown page, a comparison table, a slide deck (Marp), a chart (matplotlib), a canvas. The important insight: **good answers can be filed back into the wiki as new pages.** A comparison you asked for, an analysis, a connection you discovered — these are valuable and shouldn't disappear into chat history. This way your explorations compound in the knowledge base just like ingested sources do.

**Lint.** Periodically, ask the LLM to health-check the wiki. Look for: contradictions between pages, stale claims that newer sources have superseded, orphan pages with no inbound links, important concepts mentioned but lacking their own page, missing cross-references, data gaps that could be filled with a web search. The LLM is good at suggesting new questions to investigate and new sources to look for. This keeps the wiki healthy as it grows.

### 1.4 Indexing and logging

Two special files help the LLM (and you) navigate the wiki as it grows. They serve different purposes:

**index.md** is content-oriented. It's a catalog of everything in the wiki — each page listed with a link, a one-line summary, and optionally metadata like date or source count. Organized by category (entities, concepts, sources, etc.). The LLM updates it on every ingest. When answering a query, the LLM reads the index first to find relevant pages, then drills into them. This works surprisingly well at moderate scale (~100 sources, ~hundreds of pages) and avoids the need for embedding-based RAG infrastructure.

**log.md** is chronological. It's an append-only record of what happened and when — ingests, queries, lint passes. A useful tip: if each entry starts with a consistent prefix (e.g. `## [2026-04-02] ingest | Article Title`), the log becomes parseable with simple unix tools — `grep "^## \[" log.md | tail -5` gives you the last 5 entries. The log gives you a timeline of the wiki's evolution and helps the LLM understand what's been done recently.

### 1.5 Optional: CLI tools

At some point you may want to build small tools that help the LLM operate on the wiki more efficiently. A search engine over the wiki pages is the most obvious one — at small scale the index file is enough, but as the wiki grows you want proper search. [qmd](https://github.com/tobi/qmd) is a good option: it's a local search engine for markdown files with hybrid BM25/vector search and LLM re-ranking, all on-device. It has both a CLI (so the LLM can shell out to it) and an MCP server (so the LLM can use it as a native tool). You could also build something simpler yourself — the LLM can help you vibe-code a naive search script as the need arises.

### 1.6 Tips and tricks

- **Obsidian Web Clipper** is a browser extension that converts web articles to markdown. Very useful for quickly getting sources into your raw collection.
- **Download images locally.** In Obsidian Settings → Files and links, set "Attachment folder path" to a fixed directory (e.g. `raw/assets/`). Then in Settings → Hotkeys, search for "Download" to find "Download attachments for current file" and bind it to a hotkey (e.g. Ctrl+Shift+D). After clipping an article, hit the hotkey and all images get downloaded to local disk. This is optional but useful — it lets the LLM view and reference images directly instead of relying on URLs that may break. Note that LLMs can't natively read markdown with inline images in one pass — the workaround is to have the LLM read the text first, then view some or all of the referenced images separately to gain additional context. It's a bit clunky but works well enough.
- **Obsidian's graph view** is the best way to see the shape of your wiki — what's connected to what, which pages are hubs, which are orphans.
- **Marp** is a markdown-based slide deck format. Obsidian has a plugin for it. Useful for generating presentations directly from wiki content.
- **Dataview** is an Obsidian plugin that runs queries over page frontmatter. If your LLM adds YAML frontmatter to wiki pages (tags, dates, source counts), Dataview can generate dynamic tables and lists.
- The wiki is just a git repo of markdown files. You get version history, branching, and collaboration for free.

### 1.7 Why this works

The tedious part of maintaining a knowledge base is not the reading or the thinking — it's the bookkeeping. Updating cross-references, keeping summaries current, noting when new data contradicts old claims, maintaining consistency across dozens of pages. Humans abandon wikis because the maintenance burden grows faster than the value. LLMs don't get bored, don't forget to update a cross-reference, and can touch 15 files in one pass. The wiki stays maintained because the cost of maintenance is near zero.

The human's job is to curate sources, direct the analysis, ask good questions, and think about what it all means. The LLM's job is everything else.

The idea is related in spirit to Vannevar Bush's Memex (1945) — a personal, curated knowledge store with associative trails between documents. Bush's vision was closer to this than to what the web became: private, actively curated, with the connections between documents as valuable as the documents themselves. The part he couldn't solve was who does the maintenance. The LLM handles that.

### 1.8 Note

This document is intentionally abstract. It describes the idea, not a specific implementation. The exact directory structure, the schema conventions, the page formats, the tooling — all of that will depend on your domain, your preferences, and your LLM of choice. Everything mentioned above is optional and modular — pick what's useful, ignore what isn't. For example: your sources might be text-only, so you don't need image handling at all. Your wiki might be small enough that the index file is all you need, no search engine required. You might not care about slide decks and just want markdown pages. You might want a completely different set of output formats. The right way to use this is to share it with your LLM agent and work together to instantiate a version that fits your needs. The document's only job is to communicate the pattern. Your LLM can figure out the rest.

## 2. 团队版 LLM Wiki 思想

上面的 LLM Wiki 更偏个人知识库：一个人把资料放进 `raw/`，让 LLM 慢慢整理成 `wiki/`，再用 `AGENTS.md` 约束维护方式。社区讨论里的团队版思想，是把这个模式继续往“生产系统”方向推进。

它的核心不是换一套东西，而是把个人 wiki 中靠自觉维护的部分，改成团队能长期运行的工程机制：哪些东西能改、哪些东西必须审、哪些页面依赖哪些源文件、源文件变化后谁会过期、多个 Agent 同时编辑时怎么避免互相覆盖。

### 2.1 三层变四层

个人版通常是三层：

1. `raw`：原始资料。
2. `wiki`：LLM 整理后的知识页。
3. `schema`：`AGENTS.md` / `CLAUDE.md` 这类规则文件。

团队版建议拆成四层：

1. `Raw`：真正的原始资料，比如 PDF、截图、导出的元数据、会议记录、平台快照。它只作为事实来源，不适合频繁放进普通 git。
2. `Staging`：从 raw 里抽出来的中间结果。它还不做跨页面综合，只是把原始资料变得更干净、更结构化。
3. `Mart/Wiki`：真正给人读、给 Agent 查的知识页。这里会有 LLM 的综合判断、人类审核、概念归纳和业务解释。
4. `Schema`：规则层，决定 Agent 怎么读、怎么写、怎么判断新建还是修改、怎么做 lint。

大白话理解：`raw` 是原材料，`staging` 是洗好切好的菜，`wiki` 是做好的菜，`schema` 是厨房规矩。个人使用时可以少一道工序，团队使用时最好把每道工序分清楚。

### 2.2 raw 不一定要进普通 git

社区里的观点是：重、大、经常变、又没有 diff 价值的原始资料，不适合直接放在 wiki 仓库里。比如 PDF、网页抓取结果、录音转写、平台每天导出的元数据快照，这些东西放进普通 git 会让仓库越来越重。

更合理的做法是：raw 放对象存储、数据库、DVC、LFS 或其他外部存储里，然后用内容 hash 固定版本。wiki 页面只记录“我依赖哪个 raw 文件、当时的 hash 是什么”。

大白话理解：不是每袋面粉都要塞进菜谱仓库。菜谱里只要写清楚用了哪袋面粉、批次号是什么，真要追溯时再去仓库找原料。

### 2.3 Wiki 层必须进 git，而且要审

wiki 页面不是简单复制 raw，而是 LLM 和人一起做出的综合判断。比如一个指标怎么算、一个业务概念到底是什么意思、多个资料冲突时采信哪一个，这些都不是纯机械输出。

所以团队版要求 `Mart/Wiki` 层完整进 git，并且走 PR 审核。原因是：LLM 重新跑一次不一定生成完全一样的页面，如果不进 git，就会丢掉已经被人审核过的判断。

大白话理解：raw 是资料，wiki 是结论。资料可以外置，结论必须留痕。

### 2.4 最大风险是漂移

团队知识库最怕的不是某一篇写错，而是慢慢变旧：新资料进来了，旧页面没有更新；某个字段含义变了，引用它的页面没提醒；两个 Agent 各写一篇差不多的页面，后来没人知道该看哪个。

这就是社区里说的 drift，也就是知识图谱漂移。解决它不能只靠“记得检查”，而要靠几层机制叠加：

1. PR 审核：防止错误内容直接进主分支。
2. 页面锁：防止两个 Agent 同时改同一页。
3. 依赖图：知道每个页面依赖哪些 raw 和哪些 wiki 页。
4. 定时 lint：每天或每次合并后自动检查链接、孤岛、过时、缺失引用。
5. schema owner：规则文件由少数人维护，不能谁都随便改。

大白话理解：团队 wiki 腐烂通常不是因为没人会写，而是没人记账。团队版就是把“记账”变成自动化和流程。

## 3. 五个可优化项的大白话解释

下面这五项是从个人版走向更稳的 LLM Wiki 时，最值得补的能力。有些我们已经在当前知识库里做了一部分，有些先不做，等规模上来或理解清楚后再做。

### 3.1 第一项：给页面加 refs 依赖关系

`refs` 的作用是让每篇 wiki 页面说清楚：“我这篇文章是根据哪些资料和哪些页面写出来的。”

以前只有正文双链，比如 RAG、MCP 这类概念链接，它表达的是“这两个概念有关”。但它不一定表示“这篇文章的结论依赖那个页面”。`refs` 更严肃，它表示依赖关系。

推荐结构类似这样：

```yaml
refs:
  pages:
    - 【LLM】RAG：基础知识
  raw:
    - path: raw/Hot Module Replacement is Easy.md
      sha256: dd8130168dfdb7aa813f05ce9f7042f0cc994f3ac70df2cb8744cf9cb25af55c
```

大白话理解：双链像“相关文章”，`refs` 像“参考文献 + 进货单”。以后 raw 文件变了，就能知道哪些 wiki 页面可能需要复查。

当前状态：已经开始做。当前 `AGENTS.md` 已要求 AI 新建页面时写 `summary`、`refs.pages`、`refs.raw`；部分 AI 可维护页已经补了 raw hash。

### 3.2 第二项：写机械检查脚本

机械检查脚本负责查那些不需要 LLM 判断的问题，比如：

- 页面有没有 frontmatter。
- AI 可维护页有没有 `summary` 和 `refs`。
- `refs.raw` 记录的 raw 文件还在不在。
- raw 文件 hash 有没有变化。
- 双链有没有指向不存在的页面。
- `index.md` 有没有漏收页面。
- 有没有重名页面。

这些问题让 LLM 每次靠眼睛扫，不稳定，也浪费上下文。脚本更适合做这类确定性检查。

大白话理解：脚本像体检里的量血压、验血，先把明显指标查出来；LLM 像医生，负责解释复杂症状和判断怎么治。

当前状态：已经做了 `tools/wiki-lint.mjs`。平时可以直接运行：

```bash
node tools/wiki-lint.mjs
```

它只做机械检查。真正要判断“内容是否过时、概念是否冲突、哪些页面应该合并”时，再让 LLM 做语义体检。

### 3.3 第三项：增加 staging 中间层

`staging` 是 raw 和 wiki 之间的中间层。它不是最终笔记，也不是给人长期阅读的知识页，而是从原始资料里抽出来的“半成品”。

比如一份很长的课程资料，raw 里可能是完整文档。staging 可以先抽出：

- 这份资料讲了哪些主题。
- 有哪些命令。
- 有哪些配置项。
- 有哪些图片。
- 有哪些关键结论。
- 哪些内容可能对应已有 wiki 页面。

然后 LLM 再基于 staging 去写 wiki。这样好处是：raw 很大时不用每次重新读全文；wiki 写错时也能回头看当时提取了什么；以后换模型或重跑流程，也更容易复现。

大白话理解：不要让 LLM 每次都从一整本书里现找重点。先做一份“读书摘录卡”，后面写正式笔记时就从摘录卡开始。

当前状态：暂缓。现在你的知识库还可以直接从 raw 到 wiki，没必要马上增加一层复杂度。等 raw 继续变多、单篇资料很长、或者你想批量重跑整理流程时，再考虑 staging。

### 3.4 第四项：给 index.md 加一句话摘要

`index.md` 以前只是页面清单，像目录。加一句话摘要后，它就不只是“有什么页面”，还能告诉 Agent “这个页面大概讲什么”。

这样查询时会更准。比如同样叫“索引”，可能是数据库索引，也可能是搜索索引，也可能是 Obsidian 索引。只有标题时容易误判，有一句话摘要就容易定位。

大白话理解：只有书名的书架不好找书；每本书旁边贴一张一句话说明，找起来就快很多。

当前状态：已经做了。现在 `index.md` 的每个页面链接后面都有一句话摘要。

### 3.5 第五项：做本地搜索

当页面只有几十篇或几百篇时，Agent 先读 `index.md` 通常够用。但页面继续增长到几千篇时，`index.md` 会变得很长，Agent 每次读它也会浪费上下文。

这时可以做本地搜索工具，比如：

- 关键词搜索：按标题、正文、frontmatter 查。
- SQLite FTS5：更快的全文检索。
- 本地 embedding：找语义相近的页面。
- CLI 或 MCP：让 Agent 可以直接调用搜索工具。

大白话理解：小书架靠目录就能找书；大图书馆需要检索系统。

当前状态：暂缓。现在先把 `index.md` 和 `wiki-lint` 用好。等你明显感觉“目录太长、Agent 定位慢、经常找错页面”时，再做本地搜索最合适。

## 4. 当前知识库的阶段判断

当前这个库还处在“个人 LLM Wiki 正在工程化”的阶段，不需要一次性上团队版全套流程。

更合适的路线是：

1. 先把 `summary`、`refs`、`wiki-lint`、`index.md` 摘要这些轻量机制做好。
2. 继续观察 raw 增长速度和 wiki 页面数量。
3. 如果 raw 越来越重，再补 staging。
4. 如果页面数量大到 `index.md` 不好用了，再补本地搜索。
5. 如果以后多人协作，再考虑 PR gate、页面锁、schema owner。

大白话总结：现在先把“账本”建好，不急着上“公司级流程”。等知识库真的变大、协作真的变复杂，再逐步加工具。
