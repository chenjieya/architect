---
author: ai
ai_editable: true
summary: 'Ollama 是本地一键运行开源大模型的工具，本文对比常见本地推理方案，讲清 Ollama 的安装、常用命令、OpenAI 兼容接口，以及用 OpenAI SDK 完成对话、关思维链、流式输出与图片识别。'
refs:
  pages:
    - 【基础】推理机制
    - 【LLM】本地部署大模型
    - 【LLM】流式返回信息
  raw:
    - path: raw/agent-core/15. Ollama/课件.md
      sha256: 5a81938f957fb0c32d1efe4c6814d63c8bba29ec06861aa3d8389d75aa3186f8
    - path: raw/agent-core/15. Ollama/代码示例.ipynb
      sha256: 49f79cffbed0c32388fdb9da4b64e267929d77f40324cc8b989b32b6b1f4c860
updated_by: ai
updated: 2026-09-26
---

前面几篇讲的是模型内部的原理，这一篇把视角拉回到"怎么把模型跑起来"。要使用大模型，可以走远程 API，也可以**本地部署**。本地部署的意义在于：数据不出本机、不按调用量付费、能离线跑。而 [[【LLM】本地部署大模型]] 里提到，自己用 `PyTorch + Transformers` 搭环境门槛不低——这一篇介绍的 **Ollama**，就是把这套门槛抹平的命令行工具。

## 1. 为什么要有本地模型方案

本地部署的核心诉求有三个：

- **隐私**：对话内容、代码、文件都留在自己机器上，不经过第三方服务器。
- **成本**：模型下载一次，之后推理不再按 token 计费（只花自己的电和显卡）。
- **可控**：能指定具体模型版本、量化精度，也能在没有外网时继续使用。

代价是：模型能力受限于本地硬件，显存/内存不够就跑不动大模型；这跟 [[【基础】推理机制]] 里讲的推理过程直接相关——推理要反复读写 K/V 缓存，显存越大越从容。

## 2. 常见本地推理方案对比

本地跑模型的工具很多，定位各不相同，选之前先看清它们分别解决什么问题：

| 方案                     | 定位                                                      | 适用场景                              |
| ------------------------ | --------------------------------------------------------- | ------------------------------------- |
| `PyTorch + Transformers` | 本地训练、微调，也能推理，但需自行适配硬件加速            | 需要训练/微调，或做研究实验           |
| `Ollama`                 | 一键部署和运行开源大模型的命令行工具，内置量化与 GPU 加速 | 想快速把模型跑起来、日常对话/开发调用 |
| `llama.cpp`              | 高性能 C/C++ 推理引擎，主打 CPU 推理和多种量化            | 无独显、想在 CPU 上省内存地推理       |
| `vLLM`                   | 高吞吐推理框架，基于 PagedAttention，适合生产环境         | 服务多人并发、追求吞吐量              |
| `MLX`                    | Apple 官方 ML 框架，专为 Apple Silicon 设计               | Mac（M 系列芯片）上原生加速           |
| `LM Studio`              | 带图形界面的桌面应用，支持一键下载和运行                  | 不想敲命令、纯图形操作                |
| `LocalAI`                | 提供 OpenAI 兼容 API 的本地推理服务                       | 让现有 OpenAI 应用无缝切到本地        |

一句话选型：**开发调试、快速上手选 Ollama；Mac 想榨干芯片选 MLX；生产高并发选 vLLM；纯图形操作选 LM Studio。**

## 3. 安装与常用命令

到官网 https://ollama.com/ 自行下载安装，装完后用版本命令确认：

```shell
ollama -v
```

模型仓库在 https://ollama.com/library，可以先在里面挑模型。国内下载慢时，可设置镜像环境变量：

```shell
export OLLAMA_MODEL_SERVER="https://mirror.ollama.com"
```

最常用的几条命令：

```shell
# 拉取模型到本地
ollama pull qwen3-vl
# 查看已下载的模型
ollama list
# 删除模型
ollama rm <模型名称>
# 查看模型信息
ollama show <模型名称>
# 运行模型（进入交互对话）
ollama run <模型名称>
# 查看当前正在运行的服务
ollama ps
```

装好并 `run` 起来后，Ollama 会在本机启动一个 Web 服务，监听 **11434** 端口。浏览器访问 http://localhost:11434/ 能看到服务是否在运行。

## 4. OpenAI 兼容接口

Ollama 最省事的一点是：它对外提供了一套**和 OpenAI 一模一样的接口**（路径带 `/v1`）。这意味着任何用 OpenAI SDK 写的代码，只要改一下 base_url 就能连本地模型，无需重写。

先用 curl 验证接口是否通：

```shell
# 模型列表
curl http://localhost:11434/v1/models

# 聊天接口
curl -X POST http://localhost:11434/v1/chat/completions -H "Content-Type: application/json" -d "{\"model\": \"qwen3-vl\", \"messages\": [{\"role\": \"user\", \"content\": \"你好，请介绍一下自己\"}], \"stream\": false}"
```

## 5. 用 OpenAI SDK 调用 Ollama

先装依赖：

```shell
uv add openai==1.74.0 python-dotenv==1.2.2
```

创建客户端（`OpenAI()` 会自动读取环境变量里的 `OPENAI_BASE_URL` 和 `OPENAI_API_KEY`，指向本机 Ollama）：

```python
from utils import config
from openai import OpenAI, AsyncOpenAI

client = OpenAI()
```

### 5.1 查看模型列表

```python
list = client.models.list()
print(list.to_json())
```

### 5.2 基本对话

```python
response = client.chat.completions.create(
    model=config.OPENAI_MODEL,
    messages=[{"role": "user", "content": "你是谁"}]
)
print(response.to_json())
```

### 5.3 关闭思维链

带推理能力的模型（如 qwen3-vl）默认会先输出一段"思考"再给答案。如果只想要最终结果，可以通过 `extra_body` 传参关掉思考模式：

```python
response = client.chat.completions.create(
    model=config.OPENAI_MODEL,
    messages=[{"role": "user", "content": "你是谁"}],
    extra_body={
        "thinking": {
            "type": "disabled"  # qwen3-vl 无法直接关闭思考模式
        }
    }
)
print(response.to_json())
```

> 注意：不同模型的思考开关参数不统一，有的支持 `thinking.type=disabled`，有的根本不支持关闭。这属于各家 API 的扩展参数，需要查对应模型文档。

### 5.4 流式响应

默认调用要等模型把整段答案生成完才返回。想让文字像打字机一样边生成边显示，把 `stream=True` 打开，然后遍历返回的 chunk：

```python
import sys

stream = client.chat.completions.create(
    model=config.OPENAI_MODEL,
    messages=[
        {"role": "system", "content": "少思考，简洁回答"},
        {"role": "user", "content": "从1数到10"}
    ],
    stream=True
)

for chunk in stream:
    print(chunk)
    sys.stdout.flush()
```

原始 chunk 里带了很多元信息，通常只需要取出真正新增的那几个字。可以封装一个打印函数专门处理（原理与 [[【LLM】流式返回信息]] 讲的一样）：

```python
from utils.stream_print import print_stream

stream = client.chat.completions.create(
    model=config.OPENAI_MODEL,
    messages=[
        {"role": "system", "content": "少思考，简洁回答"},
        {"role": "user", "content": "从1数到10"}
    ],
    stream=True
)
print_stream(stream)
```

### 5.5 视觉能力（图片输入）

多模态模型还能"看图"。做法是把本地图片转成 **Base64 Data URL**，再作为一个 `image_url` 类型的消息内容块传进去：

```python
from utils.stream_print import print_stream
from utils.img_base64 import to_dataurl

# 读取本地图片并转换为 Base64
dataurl = to_dataurl("menu.png")
stream = client.chat.completions.create(
    model=config.OPENAI_MODEL,
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": "请描述这张图片的内容"},
            {"type": "image_url", "image_url": {"url": dataurl}}
        ]
    }],
    stream=True
)
print_stream(stream)
```

上面代码里用到的测试图片：

![](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/obsidian/1790408662957_menu.png)

> 关键点：图片在消息里不是普通文本，而是 `content` 数组里的一个对象，用 `type` 区分是文本还是图片；图片既可以直接给 URL，也可以给 Base64 编码后的 Data URL。

## 6. 总结

- **本地部署三诉求**：隐私、成本、可控；代价是硬件门槛。
- **方案选型**：开发上手用 Ollama，Mac 用 MLX，生产高并发用 vLLM，纯图形用 LM Studio。
- **Ollama 用法**：`pull / list / rm / show / run / ps` 六个命令 + 11434 端口服务。
- **OpenAI 兼容**：改 base_url 就能复用 OpenAI SDK；`stream=True` 做流式，多模态用 `image_url` 传图片。

模型跑起来、能对话之后，下一步就是决定"跟模型怎么说话"。这就要用到**系统提示词**，见 [[【基础】系统提示词]]。
