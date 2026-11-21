from typing import Union, Literal
from langchain.chat_models import init_chat_model
from .config import openai_settings, anthropic_settings

Provider = Union[Literal["anthropic"], Literal["openai_reasoning"]]


def create_model():
    model_name = anthropic_settings.default_model
    provider: Provider = "anthropic"
    return init_chat_model(
        model=model_name,
        model_provider=provider,
        thinking={"type": "disabled"},
        # 模型可以配置的字段，相当于白名单
        configurable_fields=["model", "temperature", "top_p", "thinking"],
    )
