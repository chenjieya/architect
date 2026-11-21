from langgraph_python.graphs import core_agent_graph
from langgraph_python.graphs.demo import (
    demo_branch_graph,
    demo_loop_graph,
    demo_parallel_graph,
)
from langgraph.checkpoint.memory import InMemorySaver

# 在内存中存储检查点，存储检查点是为了进行时间旅行
# checkpointer = InMemorySaver()  # 在agent server中，会自动帮你注入
agent = core_agent_graph.build_graph().compile()
parallel_graph = demo_parallel_graph.build_graph().compile()
branch_graph = demo_branch_graph.build_graph().compile()
loop_graph = demo_loop_graph.build_graph().compile()
