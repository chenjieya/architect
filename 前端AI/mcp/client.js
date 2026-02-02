const { spawn } = require("child_process");

// 终端启动
// 当前的进程模式是： 终端  =》 client => server

// 启动 server.js 子进程
const serverProcess = spawn("node", ["server.js"]); // node server.js

// 监听服务端的响应
// 数据是哪个进程给我的？
// 我这个进程又将数据输出到了哪个进程？

// serverProcess进程的输出，也就是 server进程的输出的数据（
serverProcess.stdout.on("data", (data) => {
  // 将当前进程的接收到的数据，发送给父进程
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
