from langchain_python.core.config import openai_settings, anthropic_settings
from langchain.agents import create_agent
from langchain.agents.structured_output import ProviderStrategy, ToolStrategy
from pydantic import BaseModel, Field
from langchain_python.tools import tools, ask_user_question
from langchain.chat_models import init_chat_model

# 测试文本
# 你把货发到我公司就行，地址是哈尔滨南岗区大街金爵万象三期三号楼，让快递联系主管田佳玉，电话就打13312345678


class AddressInfo(BaseModel):
    """用户收货地址信息"""

    name: str = Field(description="姓名")
    phone: str = Field(description="电话")
    address: str = Field(description="地址")


model = init_chat_model(
    model=anthropic_settings.default_model,
    model_provider="anthropic",
    thinking={"type": "disabled"},
)

agent = create_agent(
    model=model,
    system_prompt="请根据提供的信息提取出收货地址的结构化信息，如果提供的信息不全，必须使用 ask_user_question 工具让用户补充信息",
    tools=[ask_user_question],
    response_format=AddressInfo,
)
