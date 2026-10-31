---
author: ai
ai_editable: true
summary: 'Agent 需要联网，但传统搜索引擎返回的 HTML 塞满标签、样式、广告和 JS，既费 token 又分散注意力。本文说明为什么要有"为 Agent 而生"的搜索（Tavily/Firecrawl/Exa 等），并用 Tavily 的 search/extract/crawl 封装 web_search、fetch_url 两个工具接入 Agent。'
refs:
  pages:
    - 【实战】Agent 封装
    - 【实战】封装 Tool Calling
  raw:
    - path: raw/agent-core/22. Agent 搜索引擎/课件.ipynb
      sha256: 86fe6d07165b2f36eaba7e6bee857db3d9f7adfcfb8a25139c8c26b40264bdf8
    - path: raw/agent-core/22. Agent 搜索引擎/agent/tool/web.py
      sha256: 0c506f7a01ba542f2375bd26689e46b85c95f3ce9aa2b1099b1b043c3824acbb
    - path: raw/agent-core/22. Agent 搜索引擎/agent/config.py
      sha256: 8ed77427b2b4912390252d5ff50dc587972161c83efb837ee3da7630bba54198
    - path: raw/agent-core/22. Agent 搜索引擎/assets/AI搜索原理.svg
      sha256: 0f8d7e594cca7c0680c63ba5ffbb1955957456996b0147710a11438308cb1504
updated_by: ai
updated: 2026-10-03
---

[[【实战】Agent 封装]] 里的 Agent 只会读本地文件。要回答"苹果最新发布了哪些产品"这类问题，它必须能联网。最直接的办法是给它一个"搜索网页"的工具，但**工具返回什么**才是真正的难点。

![](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/obsidian/1791012845975_AI搜索原理.svg)

## 1. 传统搜索引擎为什么不适合 Agent

如果直接把搜索引擎的 HTML 丢给模型，会撞上一堆问题：

- **token 爆炸**：一个页面几十上百 KB，其中真正的正文可能只有几 KB，其余全在烧钱。
- **注意力被分散**：导航栏、侧边栏、页脚、广告横幅都会挤占模型的注意力预算。
- **CSR 页面拿不到内容**：很多前端渲染页面返回的 HTML 里根本没有正文（要靠 JS 执行后才出现）。
- **噪音多**：广告图片、菜单、banner 等无关信息混杂其中。
- **深层链接难一次拿全**：想要的内容常常分散在多个深层页面里。

所以 Agent 需要一个**专门为模型消费而设计**的搜索引擎：输入查询或 URL，直接返回清洗过的结构化文本。

## 2. 面向 Agent 的搜索引擎

常见选择：

- **Firecrawl**：把网页抓取并转成干净的 Markdown，适合喂给模型。
- **Tavily**：专为 LLM 设计的搜索 API，直接返回结构化结果。
- **AnySearch**、**Brave**、**Exa**：各有侧重，有的长于实时搜索，有的长于语义检索。

这些服务的共同点是：**帮 Agent 把"网页"变成"模型能直接用的上下文"**。

## 3. Tavily 快速上手

先装库（示例用 uv）：

```shell
uv add tavily-python==0.7.26
```

把申请到的 API Key 放进环境变量，再用 `pydantic-settings` 读取：

```python
from pydantic_settings import BaseSettings

class TavilySettings(BaseSettings):
    api_key: str = ""
    model_config = {"env_prefix": "TAVILY_", "env_file": "../.env"}

tavily_settings = TavilySettings()
```

初始化客户端：

```python
from tavily import TavilyClient
from agent.config import tavily_settings

client = TavilyClient(api_key=tavily_settings.api_key)
```

### 3.1 基本搜索 search

```python
response = client.search(query="可控核聚变最新研究进展")
print(json.dumps(response, indent=2, ensure_ascii=False))
```

`search` 返回的已经是提炼好的摘要与链接，而不是原始 HTML。

### 3.2 网页提取 extract

给定一批 URL，直接抓取并清洗正文：

```python
response = client.extract(
    urls=[
        "https://baike.baidu.com/item/Tavily/67277807",
        "https://baike.baidu.com/item/Firecrawl",
    ],
    include_images=True,
)
```

### 3.3 站点爬取 crawl

从种子页出发，按深度批量抓取整个站点：

```python
response = client.crawl(
    url="https://example.com/",
    max_depth=3,
    limit=50,
    instructions="找到所有和网络相关的知识",
)
```

`instructions` 用自然语言告诉它"我要什么"，比传统爬虫的规则匹配灵活得多。

## 4. 封装成 Agent 工具

有了 [[【实战】封装 Tool Calling]] 的 `@tool` 装饰器，把搜索能力包成两个工具非常直接：

```python
from agent.tool import registry
from agent.tool.core import tool
from tavily import TavilyClient
from agent.config import tavily_settings
import json


@tool(query="搜索关键字")
def web_search(query: str):
    """根据关键字进行网络搜索，返回结构化的搜索结果"""
    client = TavilyClient(api_key=tavily_settings.api_key)
    response = client.search(query=query)
    return json.dumps(response, ensure_ascii=False)


@tool(urls="要抓取的url链接数组")
def fetch_url(urls: list[str]):
    """根据提供的url数组，抓取网页内容，返回结构化的搜索结果"""
    client = TavilyClient(api_key=tavily_settings.api_key)
    response = client.extract(urls=urls, include_images=False)
    return json.dumps(response, ensure_ascii=False)


registry.register(web_search)
registry.register(fetch_url)
```

设计上有两个关键取舍：

- **返回 JSON 字符串**：Tavily 的结果本身是结构化的，`json.dumps` 后交给模型，模型更容易理解字段含义。
- **两个工具职责分离**：`web_search` 负责"发现链接"，`fetch_url` 负责"深挖内容"。模型可以先搜再抓，形成"搜索→定位→精读"的链路。

## 5. 让 Agent 用起来

注册完工具，Agent 无需任何改动就能调用：

```python
from agent.agent import Agent
from agent.printer import ModelPrinterListener

listener = ModelPrinterListener()
agent = Agent(model_listener=listener)

agent.invoke("帮我查一查苹果最新发布了哪些产品？")
agent.session.print_friendly()
```

运行时在终端能看到 Agent 先调用 `web_search` 检索，再按需 `fetch_url` 打开候选页面，最后综合出答案。

## 6. 最佳实践

- **搜索与抓取分开**：只让模型在需要细节时才抓取整页，避免一次性把所有页面塞进上下文。
- **控制返回体积**：`include_images=False` 能显著减小结果，图片对纯文本推理大多无用。
- **注意成本与额度**：搜索 API 按次计费，复杂任务可能触发多次调用，建议给 Agent 加调用次数上限。
- **结果要可读**：始终返回结构化文本（JSON / Markdown），别把原始 HTML 交给模型。

## 7. 总结

- **痛点**：传统搜索引擎的 HTML 充满噪音，既费 token 又干扰模型判断。
- **方案**：使用 Tavily / Firecrawl / Exa 等面向 LLM 的搜索服务，直接拿清洗后的结构化文本。
- **落地**：用 `@tool` 封装 `web_search`（发现链接）与 `fetch_url`（深挖内容），注册进注册表即可被 Agent 自动调用。
- **原则**：搜索与抓取分离、控制返回体积、给调用加上限。

Agent 现在能读文件、能执行命令、还能联网了。但如果每种能力都要提前写死成工具，工具会越堆越多——下一篇讲一种"按需加载提示词"的机制：[[【实战】Skill 技能系统]]。
