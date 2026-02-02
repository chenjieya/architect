const response = await fetch('http://localhost:3000/ai/ask', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    question: '你是谁?主要应用于那些方面?',
  }),
});
console.log(response, 'response<<<');

const reader = response.body.getReader(); // 拿到 Reader 对象
const decoder = new TextDecoder('utf-8'); // 创建一个 utf-8 的解码器

let res = '';
while (true) {
  const { done, value } = await reader.read(); // 读取当前块的内容
  if (done) break;

  // 对二进制数据进行解码
  const chunk = decoder.decode(value, { stream: true });
  // chunk = '{"response":"你好"}\n{"response":"，"}\n'

  // 后面就是一些 JS 相关的基操了
  const lines = chunk.split('\n').filter((line) => line.trim());
  // lines = [
  //   '{"response":"你好"}',
  //   '{"response":"，"}',
  //   '{"response":"我是"}',
  //   '{"response":"AI助手"}'
  // ]
  for (const line of lines) {
    try {
      const data = JSON.parse(line); // data = {"response":"你好"}
      if (data.response) {
        // 发送给客户端
        // res += `${JSON.stringify({ response: data.response })}\n`;
        res += `${data.response}`;
      }
    } catch (e) {
      console.error('JSON解析失败☹️', e.message);
    }
  }
}

console.log(res);
