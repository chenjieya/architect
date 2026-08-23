---
author: ai
ai_editable: true
summary: 'Token 统计：把文本转成 token 数量，分事前（拦截超长/额度/预算/报价）与事后（API 返回）。附三种统计方式的可运行代码：Moonshot API、tiktoken 本地统计、transformers 开源模型。'
refs:
  pages:
    - 【基础】词元
    - 【LLM】词元
  raw:
    - path: raw/agent-core/08. token统计/课件.ipynb
      sha256: f02eb7bff300660d8a42e56a8e24592677746322aa5cfd15b6953805bd7c1033
updated_by: ai
updated: 2026-08-22
---

上一讲 [[【基础】词元]] 讲了"文字怎么切成 token"。这一讲解决一个实际问题：**一段文本到底要消耗多少个 token？** 因为它直接决定计费、上下文长度和额度。这就是 Token 统计。

## 1. 一句话理解

**Token 统计 = 把一段文本转成它占用的 token 数量。分两种时机：事前统计（发送前）和事后统计（API 返回后）。**

## 2. 事后统计：API 会告诉你用了多少

**使用模型服务商的 API 接口，调用完它会告知你本次的 token 用量**（输入多少、输出多少、总计多少）。这是"事后"的——钱已经花了，才知道花了多少。

## 3. 事前统计：发送前就算好

**把文本发送给大模型之前进行统计**，通常用于下面几个场景：

| 场景                        | 大白话                                                                                           |
| --------------------------- | ------------------------------------------------------------------------------------------------ |
| **单轮输入长度拦截**        | 用户粘贴 10 万字合同，事前算出超 100k token，直接弹窗"文本过长，请分段上传"，不发起无效 API 调用 |
| **用户额度/充值计费预校验** | 付费产品调用前预估总 token，若剩余额度不足直接拦截提示充值，不用等 API 返回才告知超限            |
| **企业预算前置审批**        | 员工上传大文件跑分析前，本地算预估 token、换算成人民币成本，超阈值需审批再调用                   |
| **报价前置展示**            | SaaS 工具页面实时显示"本次预估 XX token，约 XX 元"，让用户确认后再执行                           |

> 大白话：**事后统计是"算账"，事前统计是"拦人"**——提前知道要花多少，才能拦截超长文本、提示余额不足、走审批、报价。

## 4. 三种统计方式（附可运行代码）

### 4.1 方式一：API 统计（Moonshot 免费接口）

**某些大模型服务商提供 API 接口，可免费计算 token 用量。** 下面以 Moonshot AI（Kimi）为例：

```python
import requests
from dotenv import load_dotenv
import os

load_dotenv("../.env")

# 以 Moonshot AI（Kimi）为例，它提供了免费的 token 统计接口
# API Key 申请地址：https://platform.moonshot.cn
API_KEY = os.environ.get("MOONSHOT_API_KEY")

url = "https://api.moonshot.cn/v1/tokenizers/estimate-token-count"

text = "人工智能正在深刻改变我们的生活，从智能助手到自动驾驶，AI 无处不在。"

response = requests.post(
    url,
    headers={
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
    },
    json={
        # "model": "moonshot-v1-8k",
        "model": "kimi-k3",
        "messages": [
            {"role": "user", "content": text},
        ],
    },
)

result = response.json()
print(f"接口返回：{result}")
print(f"文本：{text}")
print(f"文本长度：{len(text)}")
print(f"Token 数：{result['data']['total_tokens']}")
```

**特点**：需要 API Key，走网络请求，但统计结果和服务商**实际计费一致**（因为是官方接口）。

### 4.2 方式二：SDK 统计（tiktoken，本地免费）

**某些模型服务商提供 SDK，可在本地统计 token，无需 API Key。** 以 OpenAI 官方分词库 `tiktoken` 为例：

```python
import tiktoken

# tiktoken 是 OpenAI 官方的分词库
# 首次运行会联网下载词表并缓存，之后统计完全在本地进行，无需 API Key
encoding = tiktoken.encoding_for_model("gpt-4o")

text = "人工智能正在深刻改变我们的生活，从智能助手到自动驾驶，AI 无处不在。"

tokens = encoding.encode(text)
print(f"文本：{text}")
print(f"文本长度：{len(text)}")
print(f"Token 序列：{tokens}")
print(f"Token 数：{len(tokens)}")
```

**特点**：本地计算、无需 Key、速度快；但用的是 **OpenAI 的词表**，所以只对 GPT 系列模型的计费预估准确。

> 大白话：tiktoken 就是"离线复刻"了 OpenAI 的分词器，让你不花钱不联网就能预估 GPT 模型的 token 数。

### 4.3 方式三：transformers 库（开源模型）

**开源模型可以用 transformers 库统计**——它是 Hugging Face 的官方库，专门用于操作 transformers 模型。Hugging Face 是开源平台，几乎所有的开源模型都会上传到那里（官网：https://huggingface.co/）。

```python
import os

# 国内访问 HuggingFace 需配置镜像（可直连的话删除这行即可）
os.environ["HF_ENDPOINT"] = "http://hf-mirror.com"

from transformers import AutoTokenizer

# 首次运行会下载分词器文件（仅几 MB，不含模型权重），之后统计完全在本地进行
tokenizer = AutoTokenizer.from_pretrained("deepseek-ai/DeepSeek-V3")

text = "人工智能正在深刻改变我们的生活，从智能助手到自动驾驶，AI 无处不在。"

tokens = tokenizer.encode(text)
print(f"文本：{text}")
print(f"文本长度：{len(text)}")
print(f"Token 序列：{tokens}")
print(f"Token 数：{len(tokens)}")
```

**特点**：适用于**开源模型**（DeepSeek、Qwen、Llama 等），首次运行下载的是分词器文件（仅几 MB，不含模型权重），之后完全本地统计。

> 大白话：想预估 DeepSeek / Qwen 这类开源模型吃多少 token，就用它的官方分词器（AutoTokenizer）在本地算，最准。

## 5. 三种方式怎么选

| 方式         | 适用模型                     | 是否需要 Key | 是否本地   | 准确性           |
| ------------ | ---------------------------- | ------------ | ---------- | ---------------- |
| API 统计     | Moonshot 等                  | 是           | 否（联网） | 与实际计费一致   |
| tiktoken     | OpenAI（GPT 系列）           | 否           | 是         | 对 GPT 准        |
| transformers | 开源模型（DeepSeek/Qwen 等） | 否           | 是         | 对对应开源模型准 |

> 选型建议：**用哪家的模型，就用哪家的统计方式**——要么官方 API，要么官方分词器，这样预估才准。

## 6. 总结

- **Token 统计**分**事前**（拦截超长/额度/预算/报价）和**事后**（API 返回用量）。
- **三种实现**：API 统计（Moonshot 免费接口）、tiktoken（OpenAI 本地库）、transformers（开源模型分词器）。
- 代码里的分词原理、为什么中文更费 token，见 [[【基础】词元]]。

下一讲继续"语言模型怎么理解文字"，进入"神经网络的本质"。
