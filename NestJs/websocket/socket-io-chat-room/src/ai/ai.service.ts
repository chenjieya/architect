import { Injectable } from '@nestjs/common';
import { Response } from 'express';

@Injectable()
export class AiService {
  private message: { type: 'user' | 'assistant'; content: string }[] = [];
  async getModel(
    res: Response,
    ques: string,
    model: 'kimi-k2.5:cloud' | 'llama3.1' = 'llama3.1',
  ) {
    try {
      const prompt = [
        '你是一名Alvis机器人🤖助手, 应用于alvis.org.cn聊天网站。请你使用中文回答以下问题。',
        ...this.message.map(
          (item) => `${item.type === 'user' ? '用户' : '助手'}:${item.content}`,
        ),
        `用户问题: ${ques}`,
      ].join('\n');
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/josn' },
        body: JSON.stringify({
          model: model,
          prompt,
          think: false,
          stream: true,
        }),
      });
      // 整理ai返回的数据
      const reader = response.body!.getReader();
      // 创建一个utf-8解码器
      const decoder = new TextDecoder('utf-8');
      let fullResponse = '';
      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        // 解码
        const chunk = decoder.decode(value, { stream: true });

        const lines = chunk.split('\n').filter((item) => item.trim());

        for (const line of lines) {
          // {"model":"kimi-k2.5:cloud","remote_model":"kimi-k2.5","remote_host":"https://ollama.com:443","created_at":"2026-02-02T05:42:42.336127595Z","response":" 你好","done":false}
          const data = JSON.parse(line) as {
            response?: unknown;
            error?: string;
          };
          if (data.error) {
            res.status(500).json({ error: data.error || 'AI服务请求失败' });
          }
          if (data?.response) {
            console.log(`${JSON.stringify({ response: data.response })}`);
            // eslint-disable-next-line @typescript-eslint/restrict-plus-operands, @typescript-eslint/no-base-to-string, @typescript-eslint/no-unused-vars
            fullResponse += data.response;
            res.write(`${JSON.stringify({ response: data.response })}\n`);
          }
        }
      }
      this.message.push(
        { type: 'user', content: ques },
        { type: 'assistant', content: fullResponse },
      );
      if (this.message.length > 50) {
        // 只保留最后五十条消息
        this.message.splice(0, this.message.length - 50);
      }
    } catch (err) {
      console.log(`AI模型请求失: ${err}`);
      res.status(500).json({ error: 'AI服务请求失败' });
    } finally {
      console.log('finally');
      res.end();
    }
  }

  ask(question: string) {
    return true;
  }
}
