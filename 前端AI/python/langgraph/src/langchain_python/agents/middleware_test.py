from collections.abc import Awaitable
from typing import Any, Callable
from langchain.agents import create_agent
from langchain.agents.middleware import (
    AgentMiddleware,
    AgentState,
    ModelRequest,
    ModelResponse,
    ToolCallRequest,
    hook_config,
)
from langchain.agents.middleware.types import ExtendedModelResponse
from langchain.messages import ToolMessage
from langchain_core.messages import AIMessage
from langgraph.runtime import Runtime
from langgraph.types import Command
from langchain_python.core.config import anthropic_settings
from langchain_python.tools import tools


class TestMiddleware(AgentMiddleware):
    def before_agent(
        self, state: AgentState, runtime: Runtime
    ) -> dict[str, Any] | None:
        return None

    def before_model(
        self, state: AgentState, runtime: Runtime
    ) -> dict[str, Any] | None:
        return None

    def after_model(self, state: AgentState, runtime: Runtime) -> dict[str, Any] | None:
        return None

    def after_agent(self, state: AgentState, runtime: Runtime) -> dict[str, Any] | None:
        return None

    async def awrap_model_call(
        self,
        request: ModelRequest[None],
        handler: Callable[[ModelRequest[None]], Awaitable[ModelResponse[Any]]],
    ) -> ModelResponse[Any] | AIMessage | ExtendedModelResponse[Any]:
        response = await handler(request)
        return response

    async def awrap_tool_call(
        self,
        request: ToolCallRequest,
        handler: Callable[[ToolCallRequest], Awaitable[ToolMessage | Command[Any]]],
    ) -> ToolMessage | Command[Any]:
        result = await handler(request)
        return result


class Test2Middleware(TestMiddleware):
    async def awrap_model_call(
        self,
        request: ModelRequest[None],
        handler: Callable[[ModelRequest[None]], Awaitable[ModelResponse[Any]]],
    ) -> ModelResponse[Any] | AIMessage | ExtendedModelResponse[Any]:
        return await handler(request)
        # return AIMessage(content="不调用模型，直接返回")  #洋葱圈，不移交给下一个中间件




agent = create_agent(
    model=f"anthropic:{anthropic_settings.default_model}",
    tools=tools,
    system_prompt="尽量调用工具回答用户问题",
    middleware=[TestMiddleware(), Test2Middleware()],
)
