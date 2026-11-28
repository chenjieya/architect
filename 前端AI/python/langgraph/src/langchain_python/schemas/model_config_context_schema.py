from typing import Any

from .prompt_context_schema import PromptContext
from pydantic import Field


class ModelConfigContext(PromptContext):

    model_name: str | None = Field(description="模型名称", default=None)
    temperature: float | None = Field(description="温度", default=None)
    thinking: dict[str, Any] | None = Field(description="思考", default=None)

