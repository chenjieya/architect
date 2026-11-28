from typing import Any, cast

from langchain.agents import create_agent, AgentState
from langchain_python.core.config import anthropic_settings
from langchain_python.tools import tools
from langchain_python.schemas.model_config_context_schema import ModelConfigContext
from langchain_python.middlewares.dynamic_prompt import dynamic_prompt
from langchain_python.middlewares.dynamic_model import dynamic_model
from langchain.agents.middleware import AgentMiddleware

agent = create_agent(
    model=f"anthropic:{anthropic_settings.default_model}",
    tools=tools,
    context_schema=ModelConfigContext,
    system_prompt="输出尽量简洁",
    middleware=[
        cast(AgentMiddleware[AgentState, ModelConfigContext, Any], dynamic_prompt),
        dynamic_model,
    ],
)
