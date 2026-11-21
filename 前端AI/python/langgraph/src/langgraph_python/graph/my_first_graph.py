from langgraph.graph import StateGraph, START, END
from typing_extensions import TypedDict


# 图状态
class MyState(TypedDict, total=False):
    node1: str  # node1 channel
    node2: str  # node2 channel


# 定义节点
def node1(state: MyState):
    print(state, "node1 state")
    return {"node1": "node1 result"}


def node2(state: MyState):
    print(state, "node2 state")
    return {"node1": "node2 result", "node2": "node2 result"}


"""构建并编译"""

# 创建图
workflow = StateGraph(MyState)

# 添加节点
workflow.add_node(node1)
workflow.add_node(node2)

# 添加线连接node节点
workflow.add_edge(START, "node1")
workflow.add_edge("node1", "node2")
workflow.add_edge("node2", END)


# 编译(编译结果可以运行)
graph = workflow.compile()


def main():
    graph.invoke({})
