from local_model.utils import config, print_stream, to_dataurl
from openai import OpenAI, AsyncOpenAI
import sys

client = OpenAI(api_key=config.OPENAI_API_KEY, base_url=config.OPENAI_BASE_URL)

# 获取模型列表
list = client.models.list()
print(list.to_json())


# 基本对话
# response = client.chat.completions.create(
#     model=config.OPENAI_MODEL, messages=[{"role": "user", "content": "你是谁"}]
# )
# print(response.to_json())


# 关闭思维链
# response = client.chat.completions.create(
#     model=config.OPENAI_MODEL,
#     messages=[{"role": "user", "content": "你是谁"}],
#     extra_body={"thinking": {"type": "disabled"}},  # qwen3-vl无法直接关闭思考模式
# )
# print(response.to_json())


# 流式响应
# stream = client.chat.completions.create(
#     model=config.OPENAI_MODEL,
#     messages=[
#         {"role": "system", "content": "少思考，简洁回答"},
#         {"role": "user", "content": "从1数到10"},
#     ],
#     stream=True,
# )

# for chunk in stream:
#     print(chunk)
#     sys.stdout.flush()


# 流式响应提取
# stream = client.chat.completions.create(
#     model=config.OPENAI_MODEL,
#     messages=[
#         {"role": "system", "content": "少思考，简洁回答"},
#         {"role": "user", "content": "从1数到10"},
#     ],
#     stream=True,
# )
# print_stream(stream)


# 读取本地图片并转换为 Base64
# dataurl = to_dataurl("menu.png")
# stream = client.chat.completions.create(
#     model=config.OPENAI_MODEL,
#     messages=[
#         {
#             "role": "user",
#             "content": [
#                 {"type": "text", "text": "请描述这张图片的内容"},
#                 {"type": "image_url", "image_url": {"url": dataurl}},
#             ],
#         }
#     ],
#     stream=True,
# )
# print_stream(stream)
