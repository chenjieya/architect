---
author: ai
ai_editable: true
summary: '当系统提示词要塞进数据分析、客服应答等各种场景知识时会严重膨胀，而它们往往只在特定问题触发。Skill 用"渐进式披露"解决：系统提示词只放每个技能的 name + description，模型按需调用 use_skill 工具加载完整 SKILL.md 正文，并支持从社区安装公共 Skill。'
refs:
  pages:
    - 【基础】系统提示词
    - 【实战】封装 Tool Calling
    - 【实战】Agent 封装
  raw:
    - path: raw/agent-core/23. Skill/课件.ipynb
      sha256: 0637088cb3373f947015de7f616aa6912f58fd134ae0cbf6577e7ef220861fb5
    - path: raw/agent-core/23. Skill/agent/tool/use_skill.py
      sha256: a2064413a6c1081b41744c9ce11b863d1e1342de5ddff46a6467c022649d4d0e
    - path: raw/agent-core/23. Skill/agent/prompt.py
      sha256: 7053061b5642fec686cae46697aba2f549bbf685f2ea037702b19c37e43e63c8
    - path: raw/agent-core/23. Skill/agent/prompt/system.j2
      sha256: 82c942f12196dde43c015cba33aa09232847ccbf015552d4d312ca8be89818b6
    - path: raw/agent-core/23. Skill/agent/.agents/skills/no-permission/SKILL.md
      sha256: 4153137443716356615331f9d7d113eceefc35d9e50972d49f7715bf689bf719
    - path: raw/agent-core/23. Skill/assets/skill.svg
      sha256: 7f588db8fb78d036871f3376098720849b4e41a920736aaa4aff7b4e899628cc
updated_by: ai
updated: 2026-10-03
---

![](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/obsidian/1791013103855_skill.svg)

## 1. 系统提示词的膨胀问题

设想两类场景：

- **SaaS 销售数据分析**：有时用户要分析销售数据，此时需要告诉模型——数据从哪取、有哪些字段、各字段含义、常见分析方式、结果怎么展示……
- **智能客服**：用户会**经常**问产品信息，系统提示词里就得塞进全部产品清单、参数、价格、活动、购买链接……

如果把这些内容全部写进系统提示词，会出现两个问题：

1. **提示词无限膨胀**，每次请求都要为这些"大部分时候用不上"的内容付费。
2. **大部分内容只在特定问题下才需要**，常驻反而稀释了真正的关键指令。

解决办法是**按需加载**：平时只让模型知道"有哪些技能可用"，真正需要时再把该技能的完整内容注入上下文。

## 2. Skill 是什么

Skill 是一套**可插拔的专业提示词模块**。每个 Skill 对应一个特定场景（处理越权提问、数据分析、客服应答等），只有用户问题匹配该场景时，它的内容才被加载进来。

这背后的思想叫**渐进式披露（Progressive Disclosure）**：

- 第一层：Skill 的名字与一句描述，常驻系统提示词，成本极低。
- 第二层：Skill 的完整正文，模型判断需要时再用工具加载。

## 3. 编写一个 SKILL.md

一个 Skill 就是一个带 frontmatter 的 Markdown 文件，放在 `agent/.agents/skills/<技能名>/SKILL.md`。例如"拒绝无关问题"技能：

```markdown
---
name: no-permission
description: 当用户和你和开发无关的问题时，使用此技能
---

统一回复："我是一个编程助手，我无法回复你这个问题，请把话题限制在开发领域"
```

- **frontmatter**：`name` 与 `description`，前者是技能标识，后者是给模型看的"什么时候用我"。
- **正文**：真正的指令。只有加载后才会进入上下文。

## 4. 把技能清单注入系统提示词

`prompt.py` 负责扫描技能目录，只抽取 frontmatter：

```python
SKILL_BASE_DIR = Path(__file__).parent / ".agents" / "skills"


def list_skills() -> list[dict]:
    if not SKILL_BASE_DIR.exists():
        return []

    skills = []
    for skill_dir in SKILL_BASE_DIR.iterdir():
        if not skill_dir.is_dir():
            continue
        skill_file = skill_dir / "SKILL.md"
        if not skill_file.exists():
            continue

        content = skill_file.read_text(encoding="utf-8")
        parts = content.split("---")
        if len(parts) >= 3:
            meta = yaml.safe_load(parts[1])
            skills.append({skill_dir.name: meta})

    return skills
```

然后 `render_prompt` 把 `skills` 一并交给模板：

```python
def render_prompt(prompt_name: str) -> str:
    template_dir = os.path.join(os.path.dirname(__file__), "prompt")
    env = Environment(loader=FileSystemLoader(template_dir))
    template = env.get_template(f"{prompt_name}.j2")
    return template.render(
        cwd=get_cwd(),
        os=get_os(),
        is_git=get_is_git(),
        skills=list_skills(),
    )
```

系统提示词模板里新增一段 Skill 说明，只列名字和描述：

```markdown
# SKILL

Skill 是一套可插拔的专业提示词模块……只有当用户问题匹配该场景时，Skill 的内容才会被注入到你的上下文中。

## 如何使用 Skill

当用户的问题属于某个 Skill 所描述的场景时，你可以使用 `use_skill` 工具加载对应的 Skill。

## 当前可用的 Skill

{% for skill_item in skills %}
{% for skill_name, skill_meta in skill_item.items() %}

- **{{ skill_name }}**: {{ skill_meta.description }}
  {% endfor %}
  {% endfor %}
```

注意：**注入的只有名字与描述**，正文一个字都不进上下文。

## 5. use_skill 工具：按需加载正文

模型决定用某个技能时，调用 `use_skill`：

```python
SKILL_BASE_DIR = Path(__file__).parent.parent / ".agents" / "skills"


def parse_skill_file(skill_name: str) -> str:
    skill_file = SKILL_BASE_DIR / skill_name / "SKILL.md"
    if not skill_file.exists():
        raise FileNotFoundError(f"未找到 Skill: {skill_name}")
    return skill_file.read_text(encoding="utf-8")


@tool(skill_name="Skill 的名称")
def use_skill(skill_name: str) -> str:
    """根据 Skill 名称获取其完整描述，返回包含元信息、正文内容和文件路径的 JSON 字符串"""
    markdown_content = parse_skill_file(skill_name)
    parts = markdown_content.split("---")
    meta = {}
    if len(parts) >= 3:
        meta = yaml.safe_load(parts[1])
    skill_file_path = str(SKILL_BASE_DIR / skill_name / "SKILL.md")
    return json.dumps(
        {"meta": meta, "content": markdown_content, "path": skill_file_path},
        ensure_ascii=False,
        indent=2,
    )
```

返回的 JSON 包含：

| 字段      | 作用                                           |
| --------- | ---------------------------------------------- |
| `meta`    | frontmatter 元信息，模型可据此确认加载对了技能 |
| `content` | SKILL.md 完整正文，这才是真正要注入的指令      |
| `path`    | 文件路径，便于模型后续引用或继续读取           |

工具结果会作为 `role="tool"` 的消息进入上下文，等价于"临时把这段专业提示词注入进来"。

## 6. 安装公共 Skill

Skill 有事实标准，社区也提供了开箱即用的技能包。用 `skills` CLI 安装（需先装 Node）：

```shell
npx skills add https://github.com/anthropics/skills --skill frontend-design
```

安装后会在 `agent/.agents/skills/` 下落下对应目录；`skills-lock.json` 记录来源与哈希，便于版本管理：

```json
{
  "version": 1,
  "skills": {
    "frontend-design": {
      "source": "anthropics/skills",
      "sourceType": "github",
      "skillPath": "skills/frontend-design/SKILL.md",
      "computedHash": "4eabc66183767153e404b39d1b839b1c37f2d82d86f0a0d7e880a579d8d62336"
    }
  }
}
```

公共技能库可以到社区站点浏览检索。

## 7. 完整使用

```python
from agent.agent import Agent
from agent.printer import ModelPrinterListener

listener = ModelPrinterListener()
agent = Agent(model_listener=listener)

agent.invoke("帮我在 ./demo 中创建一个 html 页面，创建一个漂亮的分页表格，请使用 frontend-design skill")
agent.session.save()
```

运行时能看到：Agent 先读到系统提示词里的技能清单，发现当前任务适合 `frontend-design`，于是调用 `use_skill("frontend-design")` 加载正文，再据此写出页面。

## 8. 总结

- **问题**：把所有场景知识塞进系统提示词，会导致提示词膨胀、注意力稀释。
- **Skill**：可插拔的提示词模块，用渐进式披露按需加载。
- **清单注入**：系统提示词只放 `name + description`；正文只在命中时才进上下文。
- **`use_skill`**：按名字读取 SKILL.md，返回元信息、正文与路径。
- **生态**：Skill 有事实标准，可通过 CLI 从社区安装，`skills-lock.json` 锁定版本。

Skill 用"提示词文件"扩展 Agent 的能力。但如果要接入的是**可执行的、确定性的外部工具**（数据库、公司 API、文件系统），单靠提示词就不够——那就需要另一套标准：[[【基础】MCP 协议]]。
