---
author: human
ai_editable: false
updated_by: human
updated: 2026-08-02
---

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20260201133013469.png)

前面是通过 **提示词** 的形式，将工具箱带过去。

🙋 这种方式有什么问题？

1. 繁琐：大段大段的提示词，仅仅是为了约束大模型的输出
2. 不标准：每个开发者的提示词的描述千差万别
3. 约束力不高：即便使用了语气最重的提示词，大模型的底层原理决定了它总会有不按照要求回复的情况

为了解决这个问题，OpenAI 出手了，在 2023 年 6 月推出了 Function Calling，通过 JSON Schema 格式来进行**标准化**，主要标准两个部分：

1. 工具箱的提供

   ```js
   // 工具箱
   const tools = [
     {
       type: "function",
       name: "get_weather",
       description:
         "Get current temperature for provided coordinates in celsius.",
       parameters: {
         type: "object",
         properties: {
           latitude: { type: "number" },
           longitude: { type: "number" },
         },
         required: ["latitude", "longitude"],
         additionalProperties: false,
       },
       strict: true,
     },
   ];
   ```

2. 返回的调用工具请求

   ```js
   [
     {
       type: "function_call",
       id: "fc_12345xyz",
       call_id: "call_12345xyz",
       name: "get_weather",
       arguments: '{"latitude":48.8566,"longitude":2.3522}',
     },
   ];
   ```

可以在 [OpenAI 官方文档](https://platform.openai.com/docs/guides/function-calling?api-mode=responses&lang=javascript#function-calling-steps) 看到这个过程，也可以在 [Playground](https://platform.openai.com/playground/prompts?models=gpt-4.1) 这里体验整个过程。

🤔 为什么采用 Function Calling 能约束大模型，让它要**一定**按照要求输出一个 JSON ？

其实就是大模型微调的效果。

也正因为如此，并非所有的模型都支持 Function Calling，可以在 [Hugging Face](https://huggingface.co/models?other=function+calling&sort=trending) 上面查询某一模型是否支持 Function Calling 特性。

> [!note]
>
> Hugging Face 是目前最主流的开源 AI 模型托管与使用平台，相当于 AI 界的 Github.

注意不同的模型，Function Calling 的格式不一致。

deepseek

```js
tools = [
  {
    type: "function",
    function: {
      name: "get_weather",
      description: "Get weather of an location",
      parameters: {
        type: "object",
        properties: {
          location: {
            type: "string",
            description: "The city and state, e.g. San Francisco, CA",
          },
        },
        required: ["location"],
      },
    },
  },
];
```

GPT

```js
const tools = [
  {
    type: "function",
    name: "get_weather",
    description: "Get current temperature for provided coordinates in celsius.",
    parameters: {
      type: "object",
      properties: {
        latitude: { type: "number" },
        longitude: { type: "number" },
      },
      required: ["latitude", "longitude"],
      additionalProperties: false,
    },
    strict: true,
  },
];
```

claude

```js
"tools": [{
  "name": "get_weather",
  "description": "Get the current weather in a given location",
  "input_schema": {
    "type": "object",
    "properties": {
      "location": {
        "type": "string",
        "description": "The city and state, e.g. San Francisco, CA"
      }
    },
    "required": ["location"]
  }
}],
```

我们使用 deepseek 模型：https://api-docs.deepseek.com/guides/function_calling

---

-EOF-
