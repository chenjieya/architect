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
from langchain_python.schemas.model_config_context_schema import ModelConfigContext
from langchain_python.core.mock_model import mock_model
from langchain_python.core.config import anthropic_settings
from langchain.chat_models import init_chat_model


@wrap_model_call
async def dynamic_model(
    request: ModelRequest[ModelConfigContext],
    handler: Callable[
        [ModelRequest[ModelConfigContext]], Awaitable[ModelResponse[Any]]
    ],
) -> ModelResponse[Any] | AIMessage | ExtendedModelResponse[Any]:
    context = request.runtime.context
    if not context:
        return await handler(request)
    model_name = context.model_name
    temperature = context.temperature
    thinking = context.thinking

    if model_name is None and temperature is None and thinking is None:
        return await handler(request)

    if model_name == "fake":
        model = mock_model()
        return await handler(request.override(model=model))

    if not model_name:
        model_name = anthropic_settings.default_model

    model_config = {}
    if temperature is not None:
        model_config["temperature"] = temperature
    if thinking:
        model_config["thinking"] = thinking
    else:
        model_config["thinking"] = {"type": "disabled"}

    model = init_chat_model(
        model=model_name, model_provider="anthropic", **model_config
    )
    response = await handler(request.override(model=model))
    return response

