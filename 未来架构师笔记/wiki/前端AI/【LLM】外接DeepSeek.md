---
author: human
ai_editable: false
updated_by: human
updated: 2026-08-02
---

## 1. [[【LLM】Function Calling|Function Calling]]

[deepseek 开发平台](https://platform.deepseek.com/) 申请一个 api key

申请 api key 的时候，只有在创建的时候才能看到完整的 key，所以创建的时候一定要妥善保存

有了 api key 后，我们就可以和 deepseek 大模型进行一个交互，这里我们用 `curl` 命令发送一个 **POST 请求** 到 DeepSeek 的接口 `/chat/completions`

```bash
curl https://api.deepseek.com/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-f5f93edf175c42ee8683691f8aacfdab" \
  -d '{
        "model": "deepseek-chat",
        "messages": [
          {"role": "user", "content": "你是谁？"}
        ],
        "stream": false
      }'
```

- -H "Content-Type: application/json" \
  - `-H` 指定一个 HTTP Header。
  - `Content-Type: application/json` 告诉服务器：请求体是 JSON 格式的数据。
- -H "Authorization: Bearer sk-f5f93edf175c42ee8683691f8aacfdab" \
  - 这是 **认证信息**。
  - 使用 Bearer Token 方式授权，`sk-xxx` 是 API 密钥。
- -d '{ "model": "deepseek-chat", "messages": [{"role": "user", "content": "你是谁？"}],"stream": true}'
  - 请求体（Request Body），使用 `-d` 传递 JSON 数据。
  - "model": "deepseek-chat"：指定使用的模型名。
  - "messages": [...]：消息对象
  - "content": "你是谁？"：用户发出的具体问题或对话内容。

大模型返回内容：

```json
{
  "id": "81dddbb5-c01b-476b-a5d5-c5ac87e31b92", // 每次请求的唯一标识符（UUID）
  "object": "chat.completion", // 返回对象类型，这里表示是聊天补全结果
  "created": 1751766353, // 响应生成时间（Unix 时间戳，单位秒）
  "model": "deepseek-chat", // 使用的模型名称

  "choices": [
    // 模型返回的一个或多个回答（通常只会有一个）
    {
      "index": 0, // 当前回答的索引（从 0 开始）
      "message": {
        "role": "assistant", // 消息角色，这里是 AI 助手
        "content": "我是一个智能AI助手，随时为你提供帮助和解答问题。有什么我可以帮你的吗？" // 模型生成的文本内容
      },
      "logprobs": null, // token 概率信息（如未启用 logprobs 则为 null）
      "finish_reason": "stop" // 结束原因：stop 表示正常生成结束
    }
  ],

  "usage": {
    // 本次请求的 Token 使用情况
    "prompt_tokens": 25, // 用户输入占用的 token 数
    "completion_tokens": 19, // 模型回复占用的 token 数
    "total_tokens": 44, // 总共使用的 token 数
    "prompt_tokens_details": {
      "cached_tokens": 0 // 命中缓存的 token 数（如启用 prompt 缓存机制）
    },
    "prompt_cache_hit_tokens": 0, // 缓存命中 token 数（本次为 0，表示未命中）
    "prompt_cache_miss_tokens": 25 // 缓存未命中 token 数（本次为 25，即全部未命中）
  },

  "system_fingerprint": "fp_8802369eaa_prod0623_fp8_kvcache" // 系统/模型运行环境指纹，用于追踪模型版本等
}
```

当然，我们也可以开启流式回复：

```bash
curl https://api.deepseek.com/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-f5f93edf175c42ee8683691f8aacfdab" \
  -d '{
        "model": "deepseek-chat",
        "messages": [
          {"role": "user", "content": "你是谁？"}
        ],
        "stream": true
      }'
```

得到的回复如下：

```
data: {"id":"83e0da03-9eb4-4883-887c-14847e88a441","object":"chat.completion.chunk","created":1751767365,"model":"deepseek-chat","system_fingerprint":"fp_8802369eaa_prod0623_fp8_kvcache","choices":[{"index":0,"delta":{"content":"我是一个"},"logprobs":null,"finish_reason":null}]}


...


data: {"id":"83e0da03-9eb4-4883-887c-14847e88a441","object":"chat.completion.chunk","created":1751767365,"model":"deepseek-chat","system_fingerprint":"fp_8802369eaa_prod0623_fp8_kvcache","choices":[{"index":0,"delta":{"content":"吗"},"logprobs":null,"finish_reason":null}]}


data: {"id":"83e0da03-9eb4-4883-887c-14847e88a441","object":"chat.completion.chunk","created":1751767365,"model":"deepseek-chat","system_fingerprint":"fp_8802369eaa_prod0623_fp8_kvcache","choices":[{"index":0,"delta":{"content":""},"logprobs":null,"finish_reason":"stop"}],"usage":{"prompt_tokens":25,"completion_tokens":19,"total_tokens":44,"prompt_tokens_details":{"cached_tokens":0},"prompt_cache_hit_tokens":0,"prompt_cache_miss_tokens":25}}

data: [DONE]
```

目前的大模型仅仅是简单的 **输入** 和 **输出**，甚至连上下文都不支持。

例如下面的例子：

```bash
curl https://api.deepseek.com/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-f5f93edf175c42ee8683691f8aacfdab" \
  -d '{
        "model": "deepseek-chat",
        "messages": [
          {"role": "user", "content": "你是谁？"}
        ],
        "stream": false
      }'
```

```bash
curl https://api.deepseek.com/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-f5f93edf175c42ee8683691f8aacfdab" \
  -d '{
        "model": "deepseek-chat",
        "messages": [
          {"role": "user", "content": "我刚才说的啥？"}
        ],
        "stream": false
      }'
```

模型给出的回复：

```
你之前没有发送过任何内容哦～可能是消息没发送成功？你可以重新告诉我你的问题或需求，我会尽力帮你解答！ 😊
```

🙋 那有没有办法让模型支持上下文呢？

其实非常简单，只需要将之前的会话，加入到 messges 数组里面就行了，如下：

```bash
curl https://api.deepseek.com/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-f5f93edf175c42ee8683691f8aacfdab" \
  -d '{
        "model": "deepseek-chat",
        "messages": [
          {"role": "user", "content": "你知道大象么？"},
          {"role": "assistant", "content": "大象是陆地上体型最大的哺乳动物，以其智慧、社会性和标志性的长鼻子（象鼻）而闻名。它们分为非洲象和亚洲象两个主要种类，具有高度发达的家庭结构和情感能力。"},
          {"role": "user", "content": "我们刚才聊了啥？"}
        ],
        "stream": false
      }'
```

模型给出的回复如下：

```
我们刚才的对话非常简短，你问的是关于大象的基本信息。具体内容如下：  \n\n1. **你的提问**：你知道大象么？  \n2. **我的回答**：介绍了大象是陆地上最大的哺乳动物，提到它们的智慧、社会性、象鼻的功能，以及非洲象和亚洲象的区别。  \n\n然后你接着问到了**之前的聊天内容**，也就是现在这一轮对话。  \n\n如果需要更详细的大象知识（比如习性、保护现状等），或者想聊其他话题，可以随时告诉我！ 😊
```

所以，大模型支持上下文的原理非常的简单，就是将之前的聊天记录一并给它。

**实践**

重构当前 AI 聊天机器人

---
