---
author: human
ai_editable: false
updated_by: human
updated: 2026-08-02
---

## 1. **Ollama Web 服务**

前面我们是通过终端，来和大模型进行交互的。

另外，Ollama 还会启动一个 Web 服务器，监听 11434 端口，用来提供模型调用能力。

```bash
curl http://localhost:11434/api/tags   # 查看本地模型
```

```bash
curl http://localhost:11434/api/generate -d '{
  "model": "deepseek-r1:latest",
  "prompt": "你是谁？"
}'
```

## 2. **Agent**

这里的 Agent，不是指的 AI 智能体，而是指代理服务器。

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20260130160510086.png)

代理服务器充当用户和模型交流的中间人。
