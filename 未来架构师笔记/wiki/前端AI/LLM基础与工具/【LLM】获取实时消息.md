---
author: human
ai_editable: false
updated_by: human
updated: 2026-08-02
---

目前，我们做出来了最初版本的 Chat-GPT 的效果，但是当前这个版本的聊天机器人，无法获取实时的消息。

🤔 如何能够让模型获取实时信息呢？

我们可以采用这样的一种方案：

大模型不会直接使用工具，只会返回【我要使用 XXX 工具】的信息

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20260201133013469.png)

🤔 **工具箱** 以什么样的形式带过去？

早期的时候，采用的是 **提示词** 的方式。

**外部工具**

1. 翻译：百度翻译
2. 天气：和风天气
