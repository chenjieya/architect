from langchain_core.messages import AIMessage
from langgraph.errors import NodeError
from langgraph.graph import StateGraph, START, END
from langgraph.types import Command, RetryPolicy, TimeoutPolicy
from langgraph_python.states.core_agent_state import ContextSchema, CoreAgentState
from langgraph_python.nodes.call_model import call_model
from langgraph.prebuilt import ToolNode
from langgraph_python.tools import tools


def should_continue(state: CoreAgentState) -> str:
    """判断是否需要调用工具：最后一个消息带 tool_calls 则路由到 tools，否则结束"""
    last_message = state["messages"][-1]
    return "tools" if last_message.tool_calls else END  # type: ignore

def error_handler(state: CoreAgentState, error: NodeError):
    msg = f"{error.node}节点发生了错误：{error.error}"
    # Command update是为了更新节点状态， goto是指定吓一跳。 坑：静态边节点和goto节点都会执行
    return Command(update={"messages": [AIMessage(msg)]}, goto=END)

def build_graph():
    """生成核心 Agent 图（未编译）"""
    workflow = StateGraph(CoreAgentState, context_schema=ContextSchema)

    # 容错机制
    workflow.set_node_defaults(
        # retry_policy=RetryPolicy(max_attempts=3),
        # timeout=TimeoutPolicy(run_timeout=3, idle_timeout=1),
        error_handler=error_handler # type: ignore
    )

    # 生成节点
    workflow.add_node("model", call_model)
    workflow.add_node("tools", ToolNode(tools))

    # 生成边
    workflow.add_edge(START, "model")

    workflow.add_conditional_edges(
        "model", should_continue, {"tools": "tools", END: END}
    )

    workflow.add_edge("tools", "model")

    return workflow
