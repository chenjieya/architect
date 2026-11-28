import re

from langchain.agents import create_agent
from langchain.agents.middleware import PIIMiddleware
from langchain.tools import tool

from langchain_python.core.mock_model import mock_model


def _fixed_response_model(text: str):
    """创建只返回固定文本的模拟模型。"""
    return mock_model(
        {
            "rules": [],
            "responses": [{"text": text}],
        }
    )


def _parrot_model():
    """创建回显最后一条输入消息的模拟模型。"""
    return mock_model({"mode": "parrot"})


# 演示内置 PII 类型以及 redact、mask、hash 三种处理策略。
pii_input_agent = create_agent(
    model=_parrot_model(),
    middleware=[
        PIIMiddleware("email", strategy="redact"),
        PIIMiddleware("credit_card", strategy="mask"),
        PIIMiddleware("ip", strategy="hash"),
        PIIMiddleware("mac_address", strategy="redact"),
        PIIMiddleware("url", strategy="redact"),
    ],
)


# 演示 block：检测到邮箱后直接终止 Run。
pii_block_agent = create_agent(
    model=_fixed_response_model("这条消息不会在拦截成功时返回"),
    middleware=[
        PIIMiddleware("email", strategy="block"),
    ],
)


# 演示使用正则表达式定义项目自己的 PII 类型。
pii_custom_agent = create_agent(
    model=_parrot_model(),
    middleware=[
        PIIMiddleware(
            "student_id",
            detector=r"STU-\d{6}",
            strategy="redact",
        ),
    ],
)


def detect_phone_number(content: str):
    """检测中国手机号。"""
    matches = []
    for match in re.finditer(r"(?<!\d)1[3-9]\d{9}(?!\d)", content):
        matches.append(
            {
                "value": match.group(),
                "start": match.start(),
                "end": match.end(),
            }
        )
    return matches


# 演示使用检测函数定义项目自己的 PII 类型。
pii_custom_detector_agent = create_agent(
    model=_parrot_model(),
    middleware=[
        PIIMiddleware(
            "phone_number",
            detector=detect_phone_number,
            strategy="mask",
        ),
    ],
)


# 演示模型输出脱敏：模拟模型会固定返回一个邮箱。
pii_output_agent = create_agent(
    model=_fixed_response_model("请联系 support@example.com"),
    middleware=[
        PIIMiddleware(
            "email",
            strategy="redact",
            apply_to_output=True,
        ),
    ],
)


@tool
def get_customer_profile() -> str:
    """查询测试客户资料。"""
    return "客户邮箱是 tool@example.com"


# 第一次模型调用生成工具调用，收到工具结果后结束。
_tool_result_model = mock_model(
    {
        "rules": [
            {
                "when": {"last_message": "human"},
                "respond": {
                    "tool_calls": [
                        {
                            "name": "get_customer_profile",
                            "args": {},
                        }
                    ]
                },
            },
            {
                "when": {"last_message": "tool_result"},
                "respond": {"text": "客户资料查询完成"},
            },
        ],
        "responses": [{"text": "客户资料查询完成"}],
    }
)


# 演示工具结果脱敏：在工具结果再次送入模型之前处理。
pii_tool_result_agent = create_agent(
    model=_tool_result_model,
    tools=[get_customer_profile],
    middleware=[
        PIIMiddleware(
            "email",
            strategy="redact",
            apply_to_input=False,
            apply_to_output=False,
            apply_to_tool_results=True,
        ),
    ],
)

