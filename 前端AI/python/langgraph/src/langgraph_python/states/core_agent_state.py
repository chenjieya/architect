from typing import Any, TypedDict, Required, Annotated, NotRequired
from langchain_core.messages import BaseMessage
from pydantic import BaseModel, Field
from .model_config import ModelConfig
from langgraph.graph.message import add_messages

# 模型的自定义配置，通过新版本的runtime配置， configurable用于配置内置配置
class ContextSchema(BaseModel):
    """上下文 Schema"""

    # 模型可配置字段
    model: str | None = Field(description="模型", default=None)
    temperature: float | None = Field(description="温度", default=None)
    top_p: float | None = Field(description="核采样概率", default=None)
    thinking: dict[str, Any] | None = Field(description="思考配置", default=None)

    # 提示词与工具配置
    system_prompt: str | None = Field(description="系统提示词", default=None)
    tools: list[str] | None = Field(description="工具列表", default=None)



class CoreAgentState(TypedDict):
    """核心 Agent 图状态"""

    # 消息列表，使用 add_messages reducer 自动累积
    messages: Required[Annotated[list[BaseMessage], add_messages]]
    # 模型配置，invoke 时传入，节点内透传给 create_model（后续不在使用，模型的配置可以动态切换，调用模型的时候传入配置，他们共享contextvar，在节点里面也会读取到公用的）
    # model_config: NotRequired[ModelConfig]
    # 系统提示词模板名称，选填，默认 system
    # system_prompt_template: NotRequired[str]
