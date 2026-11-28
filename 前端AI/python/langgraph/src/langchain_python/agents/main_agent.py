
from langchain.agents import create_agent
from langchain_python.core.config import anthropic_settings
from langchain_python.tools import tools
from langchain_python.schemas.prompt_context_shcema import PromptContext
from langchain_python.middlewares.dynamic_prompt import dynamic_prompt

agent = create_agent(
    model=f"anthropic:{anthropic_settings.default_model}",
    tools=tools,
    context_schema=PromptContext,
    system_prompt="输出尽量简洁",
    middleware=[dynamic_prompt],
)
