from collections.abc import Awaitable, Callable
from typing import Any, Callable

from langchain.agents.middleware import AgentMiddleware, wrap_model_call
from langchain.agents.middleware.types import (
    ExtendedModelResponse,
    ModelRequest,
    ModelResponse,
)
from langchain.agents import AgentState
from langchain_core.messages import AIMessage
from langchain.messages import SystemMessage
from langchain_python.schemas.prompt_context_schema import PromptContext


@wrap_model_call
async def dynamic_prompt(
    request: ModelRequest[PromptContext],
    handler: Callable[[ModelRequest[PromptContext]], Awaitable[ModelResponse[Any]]],
) -> ModelResponse[Any] | AIMessage | ExtendedModelResponse[Any]:
    prompts = []
    if request.system_prompt:
        prompts.append(request.system_prompt)

    if request.runtime.context and request.runtime.context.system_prompt:
        prompts.append(request.runtime.context.system_prompt)
    system_msg = SystemMessage(prompts)
    print(f"[jie.chen] {system_msg}")
    override_request = request.override(system_message=system_msg)
    response = await handler(override_request)
    return response

