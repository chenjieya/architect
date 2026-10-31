---
author: ai
ai_editable: true
summary: 'Reducer 决定图状态每个字段如何合并新旧值。本文讲清覆盖、追加、取最大值三种写法，以及内置 add_messages 按 id 更新的规则。'
refs:
  pages:
    - 【基础】核心概念与执行模型
    - 【基础】模型接入与消息体系
    - 【实战】Command、中断与人在回路
  raw:
    - path: raw/langgraph-python/06. Reducer.ipynb
      sha256: 149d7f4efff6d62a855121f01fb299e0e10277dc9bd958057ac8b62d33fe7c04
    - path: raw/langgraph-python/assets/初始图结构.svg
      sha256: 1e14c1e9c29697ca673d5a0919daeae0cb67f30ffeb8245de0063184bbcedf72
updated_by: ai
updated: 2026-10-31
---

图状态是节点之间共享的字典，但"写回字典"并不是简单的赋值：当多个节点、甚至同一超步里的多个并行分支都要修改同一个字段时，必须有人规定**新旧值怎么合并**。这个规则就是 **Reducer**。

## 1. Reducer 的本质

Reducer 在 Python 里就是一个函数：接收"前一个值"和"后一个值"，返回合并后的新值。

```python
def add(a, b):
    return a + b          # 追加 / 累加

def overwrite(a, b):
    return b              # 永远用新值覆盖旧值
```

`operator.add` 就是现成的追加式 Reducer：

```python
import operator

operator.add(1, 2)          # 3
operator.add([1, 2], [3, 4])  # [1, 2, 3, 4]
operator.add("a", "b")      # "ab"
```

## 2. 在 State 里声明 Reducer

在 `TypedDict` 中用 `Annotated[类型, reducer]` 指定。没有指定的字段默认使用覆盖式 Reducer。

```python
from typing import Annotated, List, NotRequired, TypedDict
import operator

class MyState(TypedDict):
    covered: NotRequired[str]                                    # 覆盖
    append_list: NotRequired[Annotated[List[str], operator.add]]  # 追加
    high_score: NotRequired[Annotated[int, lambda a, b: max(a, b)]]  # 取最大
```

节点只返回自己关心的字段，框架会按字段各自调用对应的 Reducer：

```python
def node1(state: MyState):
    return {"covered": "node1", "append_list": ["node1"], "high_score": 5}

def node2(state: MyState):
    return {"covered": "node2", "append_list": ["node2"], "high_score": 3}
```

两轮执行后：

- `covered` 是 `"node2"`，后写覆盖先写；
- `append_list` 是 `["node1", "node2"]`，按执行顺序累积；
- `high_score` 是 `5`，取两者最大值。

两个约束需要注意：

- Reducer 的返回类型必须与字段类型一致，否则后续节点拿到的状态会不符合声明。
- 并行分支的写入会在超步边界统一合并，Reducer 必须能处理同一轮里的多次追加。超步概念见 [[【基础】核心概念与执行模型]]。

![](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/obsidian/1793426491423_初始图结构.svg)

## 3. 内置 Reducer：add_messages

消息列表几乎每个图都有，LangGraph 提供了专用 Reducer `add_messages`。它不只是追加，还会**按消息 id 做去重与更新**：

```python
from langgraph.graph.message import add_messages

messages = add_messages([], [SystemMessage("系统消息", id=1)])
messages = add_messages(messages, HumanMessage("用户消息", id=2))
messages = add_messages(messages, AIMessage("AI 回复", id=3))
```

关键行为：

| 操作                 | 结果                               |
| -------------------- | ---------------------------------- |
| 传入新 id 的消息     | 追加到列表末尾                     |
| 传入已存在 id 的消息 | 用新内容**原位替换**旧消息，不新增 |
| 传入单条消息而非列表 | 自动包装成列表                     |

因此，想"修改历史消息"时，只要保持同一个 id 再写一次即可；想"新增一轮"则给一个新 id。会话管理的细节见 [[【基础】模型接入与消息体系]]。

```python
class AgentState(TypedDict):
    messages: Annotated[list, add_messages]
    step_count: int
```

## 4. 什么时候需要自定义 Reducer

- 需要去重、排序、取最大/最小、按 key 合并字典；
- 并行分支会写同一个字段，且希望合并而不是互相覆盖；
- 需要把结构化结果聚合成一个对象。

自定义时优先写成**纯函数**（不依赖外部状态），并保证对同一组输入结果稳定，否则时间旅行与重放会得到不一致的结果，见 [[【实战】时间旅行]]。
