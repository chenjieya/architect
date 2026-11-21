import os
import subprocess
from typing import Any
from langchain_core.messages import SystemMessage, content
from langchain_core.runnables import RunnableConfig
from langchain_core.tools import BaseTool
from langgraph.runtime import Runtime
from tavily import config
from langgraph_python.states.core_agent_state import ContextSchema, CoreAgentState
from langgraph_python.states.model_config import ModelConfig
from langgraph_python.template import prompt_from_filename
from langgraph_python.core.create_model import create_model
from langgraph_python.tools import tools
from langgraph_python.core.mock_model import mock_model
from langgraph_python.tools import get_tools, tools


# create_model 中声明的可配置模型字段，Context 中的同名字段需要转给模型的调用配置
_MODEL_CONFIG_FIELDS = ("model", "temperature", "top_p", "thinking")

# 根据runtime获取到上下文配置信息
def _get_context(runtime: Runtime[ContextSchema]) -> ContextSchema:
    return runtime.context


# 根据配置创建模型，默认配置的模型
def _get_model(context: ContextSchema):
    "根据配置获取模型对象"
    if context and context.model == "fake":
        return mock_model()
    return create_model()

# 根据配置获取系统提示词
def _get_systen_message(context: ContextSchema) -> list[SystemMessage]:
    "根据配置获取系统提示词"
    
    if not context or not context.system_prompt:
        return []
    return [SystemMessage(context.system_prompt)]


# 根据配置获取可以调用的工具
def _get_tool(context: ContextSchema) -> list[BaseTool]:
    "根据配置获取工具"
    if not context or context.tools is None:
        return tools
    return get_tools(context.tools)


def _get_model_config(context: ContextSchema) -> RunnableConfig:
    "模型 invoke 只读 config.configurable，不读 Context，需手动把模型配置转成调用配置"
    if not context:
        return {}
    configurable = {
        name: getattr(context, name)
        for name in _MODEL_CONFIG_FIELDS
        if getattr(context, name) is not None
    }
    return {"configurable": configurable}

async def call_model(state: CoreAgentState, runtime: Runtime[ContextSchema]) -> dict:
    """调用模型节点"""
    
    # 获取上下文自定义配置信息
    context = _get_context(runtime)

    messages = state["messages"]  # 取出messages，不包含系统提示词

    system_message = _get_systen_message(context)
    model = _get_model(context)
    tools = _get_tool(context)

    model_with_tools = model.bind_tools(tools)

    response = await model_with_tools.ainvoke(
        [*system_message, *messages],
        config = _get_model_config(context)
    )
    return {"messages": [response]}
