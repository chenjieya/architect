---
author: ai
ai_editable: true
summary: 'HITL 中间件在工具执行前暂停等待人工审批：讲清 interrupt_on 的三种配置、动态说明与触发条件，以及 approve/edit/reject/respond 四种恢复格式。'
refs:
  pages:
    - 【基础】中间件机制与预置中间件
    - 【实战】Command、中断与人在回路
  raw:
    - path: raw/langchain-python/17. HITL中间件.md
      sha256: bee318f7e0408453e13b6613b42366dd4d9f23a5372d8298aff345ee28cb7400
updated_by: ai
updated: 2026-11-28
---

删除文件、覆盖数据、发起支付——这些动作让模型自己决定太危险。`HumanInTheLoopMiddleware`（HITL，人在回路）的做法是：**工具马上要执行时先按下暂停键，把"我要做什么"给人看，等人点头再继续**。它的底层中断机制与 [[【实战】Command、中断与人在回路]] 是一套东西，这里只是把它做成了针对工具的自动化关卡。

## 1. 配置中断时机

用 `interrupt_on` 按工具名逐个配置：

```python
from langchain.agents.middleware import HumanInTheLoopMiddleware


def format_description(tool_call, state, runtime):
    """根据本次工具调用动态生成审批说明。"""
    return f"即将写入文件：{tool_call['args']['file_path']}"


def should_interrupt(request):
    """只有写入 /home/user 目录时才中断。"""
    return request.tool_call["args"]["file_path"].startswith("/home/user/")


HumanInTheLoopMiddleware(
    interrupt_on={
        # 调用时始终中断，允许 approve、edit、reject、respond
        "write_file": True,

        # 调用时不中断，直接执行
        "read_file": False,

        # 调用时始终中断，但只允许批准或拒绝
        "delete_file": {
            "allowed_decisions": ["approve", "reject"],
            "description": "删除文件前需要人工确认。",
        },

        # 根据本次工具调用的参数，动态决定是否中断
        "edit_file": {
            "allowed_decisions": ["approve", "edit", "reject"],
            "description": format_description,
            "when": should_interrupt,
        },
    },
    # 没有单独配置 description 时，用这个前缀生成审批说明
    description_prefix="工具执行前需要人工审批",
)
```

三种写法对应三种严格程度：

| 写法    | 含义                                 | 适合                         |
| ------- | ------------------------------------ | ---------------------------- |
| `True`  | 每次调用都暂停，四种决定全开放       | 高风险且需要人灵活处理的工具 |
| `False` | 不暂停，直接执行                     | 只读、无副作用的工具         |
| 字典    | 自定义允许的决定、说明文字、触发条件 | 需要精细控制的场景           |

字典里的 `when` 特别实用：它不是"一调用就拦"，而是先看参数。比如同样是编辑文件，改 `/home/user/` 下的要审批，改临时目录的可以直接放行。这样既守住关键边界，又不让人被审批消息淹没。

## 2. 中断时人看到什么

暂停后，调用方会收到一份结构化的"审批请求"：

```json
{
  "action_requests": [
    {
      "name": "write_file",
      "args": {
        "file_path": "/home/user/notes.md",
        "content": "文件内容"
      },
      "description": "工具执行前需要人工审批……"
    }
  ],
  "review_configs": [
    {
      "action_name": "write_file",
      "allowed_decisions": ["approve", "edit", "reject", "respond"]
    }
  ]
}
```

分成两块很好理解：`action_requests` 说"模型想干什么"（工具名 + 参数 + 说明），`review_configs` 说"你能怎么处理它"（允许的决定列表）。

## 3. 恢复中断的四种决定

人看完之后，把决定提交回去，图才能继续。共有四种：

### 3.1 批准

用原工具名和原参数继续执行：

```json
{
  "decisions": [
    {
      "type": "approve"
    }
  ]
}
```

### 3.2 修改后批准

人改了参数再执行。适合"路径不对，换个地方存"这类情况：

```json
{
  "decisions": [
    {
      "type": "edit",
      "edited_action": {
        "name": "write_file",
        "args": {
          "file_path": "/home/user/notes.md",
          "content": "修改后的文件内容"
        }
      }
    }
  ]
}
```

### 3.3 拒绝

跳过这次工具执行。`message` 可选，中间件会把它作为一条失败的 `ToolMessage` 回给模型——模型看到失败原因，有机会换个方案：

```json
{
  "decisions": [
    {
      "type": "reject",
      "message": "不允许覆盖该文件，请改用新文件名。"
    }
  ]
}
```

### 3.4 代替工具回答

同样跳过工具执行，但把 `message` 当作**成功返回值**交给模型。适合那些本质上该由人直接回答的工具，比如"告诉我保存位置"：

```json
{
  "decisions": [
    {
      "type": "respond",
      "message": "请将文件保存到 /home/user/drafts/notes.md。"
    }
  ]
}
```

`reject` 和 `respond` 的关键区别：前者给模型一个失败信号，后者给模型一个"人已替你办妥"的成功结果。选错会让模型走完全不同的后续路线。
