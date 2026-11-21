from langchain_core.tools import BaseTool

from .sub_agent import call_sub_agent
from .time import get_current_time
from .web import fetch_url, web_search
from .ask_user_question import ask_user_question

_AVAILABLE_TOOLS: dict[str, BaseTool] = {
    "get_current_time": get_current_time,
    "fetch_url": fetch_url,
    "web_search": web_search,
    "sub_agent": call_sub_agent,
    "ask_user_question": ask_user_question
}


tools: list[BaseTool] = list(_AVAILABLE_TOOLS.values())


def get_tools(tool_names):
    return [_AVAILABLE_TOOLS[name] for name in tool_names if name in _AVAILABLE_TOOLS]
