---
author: human
ai_editable: false
updated_by: human
updated: 2026-08-02
---

## 1. stdio

进程：执行一个应用程序，就会启动一个进程，操作系统会为其分配内存空间、系统资源。

应用程序执行完毕后，系统分配给进程的资源就会被回收。

**演示**

进程之间是可以通信的。那这里有一个最基本的要求：进程不能结束。如何让进程不结束？

想想微信、QQ 启动后为啥不结束？

因为要监听。

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20260202172458715.png)

这里也同样，只要进程处于监听状态，就不会结束。

```js
// 监听输入
process.stdin.on("data", () => {});
```

除此之外，**一个进程还可以启动另一个进程**，这在操作系统中是非常常见和常用的行为，被称之为 **父子进程模型**。

控制台其实也是一个应用程序，启动后也会有进程。因此下面的代码：

```bash
node index.js
```

控制台就是父进程，node 程序就是子进程。

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20260202172509565.png)

🙋 让终端和 node 程序进行通信，该如何进行通信？

stdio: **st**an**d**ard **i**nput and **o**utput 标准输入输出

每一个进程启动后，都会留出两个对外通信的接口：

- 标准输入接口：standard in
- 标准输出接口：standard output

上面进程监听输入和对外输出的图，就可以变成这样：

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20260202172535704.png)

结合前面父子模型的知识：

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20260202172550898.png)

**实践**

终端和 node 进程通信

再看下面的例子，增加一个 client.js

```js
const { spawn } = require("child_process");

// 启动 server.js 子进程
const serverProcess = spawn("node", ["server.js"]); // node server.js

// 监听服务端的响应
// 数据从哪里来？哪个进程给我的
// 数据会输出到哪儿？我给哪个进程
serverProcess.stdout.on("data", (data) => {
  process.stdin.write(data.toString()); // 🙋 往哪里输出？
});

// 发送几条测试消息
const messages = ["生命有意义吗？", "宇宙有尽头吗？", "再见！"];

messages.forEach((msg, index) => {
  setTimeout(() => {
    console.log(`-->${msg}`);
    serverProcess.stdin.write(msg);
  }, index * 1000); // 每秒发一条
});
```

如下图：

![image-20250715000332368](https://xiejie-typora.oss-cn-chengdu.aliyuncs.com/2025-07-14-160333.png)

stdio 通信高效、简洁，但仅适用于本地进程间通信

## 2. 通信格式

通信涉及到数据传输，数据传输的格式有多种：

- xml
- json
- 字符串

**JSON-RPC2.0**

英语全称为 JSON Remote Procedure Call，远程函数调用。

request

```json
{
  "jsonrpc": "2.0",
  "method": "sum",
  "params": {
    "a": 5,
    "b": 6
  },
  "id": 1
}
```

response

```json
{
  "jsonrpc": "2.0",
  "result": 11,
  "id": 1
}
```

## 3. MCP Server

MCP 是一套 **标准协议**， 它规定了 **应用程序** 之间 **如何通信**

如何通信：

- 通信方式
  - stdio： 推荐，高效、简洁、本地
  - http： 可远程
    - StreamHTTP
    - SSE
- 通信格式： 基于 JSON-RPC 的进一步规范

### 3.1 基本规范

**1. 初始化 initialize**

两个应用程序要开始通信，首先需要初始化

request

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "initialize", // 固定为 initialize
  "params": {
    "protocolVersion": "2024-11-05",
    "capabilities": {
      "roots": {
        "listChanged": true
      },
      "sampling": {},
      "elicitation": {}
    },
    "clientInfo": {
      // 告知服务器客户端的信息
      "name": "ExampleClient",
      "title": "Example Client Display Name",
      "version": "1.0.0"
    }
  }
}
```

response

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "protocolVersion": "2024-11-05",
    "capabilities": {
      "logging": {},
      "prompts": {
        "listChanged": true
      },
      "resources": {
        "subscribe": true,
        "listChanged": true
      },
      "tools": {
        "listChanged": true
      }
    },
    "serverInfo": {
      // 服务端信息
      "name": "ExampleServer",
      "title": "Example Server Display Name",
      "version": "1.0.0"
    },
    "instructions": "Optional instructions for the client"
  }
}
```

**2. 发现工具 `tools/list`**

服务器有哪些工具函数可以供客户端调用

request

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/list"
}
```

response

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "tools": [
      {
        "name": "get_weather",
        "title": "Weather Information Provider",
        "description": "Get current weather information for a location",
        "inputSchema": {
          "type": "object",
          "properties": {
            "location": {
              "type": "string",
              "description": "City name or zip code"
            }
          },
          "required": ["location"]
        }
      }
    ]
  }
}
```

**3. 工具调用 `tools/call`**

request

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call", // 调用工具
  "params": {
    "name": "get_weather", // 工具名，对应工具发现中的name
    "arguments": {
      // 工具参数，需要和工具发现中的结构一致
      "location": "New York"
    }
  }
}
```

response

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "content": [
      {
        // 函数结果需要放到content字段中，如果有多个，使用数组
        // 函数结果的类型
        // 支持的类型： https://modelcontextprotocol.io/specification/2025-06-18/server/tools#tool-result
        "type": "text",
        "text": "72°F"
      }
    ]
  }
}
```

工具返回的类型有 [多种](https://modelcontextprotocol.io/specification/2025-06-18/server/tools#tool-result)

**实践**

实现遵循 MCP 协议的服务器

🤔 服务器是否能够和其它遵循 MCP 协议的应用程序通信？

### 3.2 调试工具

服务器目录下，直接运行

```bash
npx @modelcontextprotocol/inspector
```

## 4. 官方 SDK

非业务代码，一般就会封装出来。

使用`@modelcontextprotocol/sdk`可以更方便的开发`MCP Server`

```bash
npm install @modelcontextprotocol/sdk
```

**实践**

使用官方 SDK 实现 MCP 服务器

## 5. 对接 AI 应用

什么是 AI 应用程序？

所有能与大模型交互的应用都可以看作是 AI 应用程序

常见的 AI 应用程序：

- ChatGPT
- DeepSeek Chat Page
- Claude Desktop
- VSCode
- Cursor
- ...

凡是支持 MCP 协议的 AI 应用，就可以充当客户端，连接 MCP 服务器。

- Claude Desktop
  支持 MCP 协议，可充当 MCP 客户端
  https://claude.ai/download
- Cursor
  支持 MCP 协议，可充当 MCP 客户端
  https://cursor.com/cn

整个流程如下图：

用户和 AI 应用进行交互，AI 应用背后调用的是大模型。

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20260202175356019.png)

但是有些事情，大模型办不到。

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20260202175401472.png)

此时可以通过 MCP 服务器扩宽大模型的能力边界。

🤔 工具是谁调用，大模型调用么？

不是大模型调用，大模型只接收 **输入** 和 **输出**。

所以大模型会回复：我需要调用 XXX 工具。

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20260202175410859.png)

然后 AI 应用调用工具，将工具调用结果返回给大模型。

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20260202175418069.png)

两个核心概念：

- `MCP Host`: 往往指代 AI 应用本身，用于发现 MCP Server 以及其中的工具列表
- `MCP Client`： 用于和 MCP Server 通信的客户端，往往在 Host 内部开启，通常情况下，每启动一个 MCP Server，就会开启一个 MCP Client

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20260202175424954.png)

例如：

1. 在 Claude Desk 中打开一个新的聊天窗口
2. Claude 查看当前启用了哪些 MCP Server
3. Claude（host）为每个 MCP Server 创建一个 Client
4. 每个 Client 分别启动各自的 MCP Server，并且进行了 2 次通信，一次是初始化，另外一次是 tools/list。
5. 当时机到达时（要调用工具的时候），每个 Client 负责调用各自的工具并把结果传递给 Host
6. Host 根据结果处理后续逻辑
