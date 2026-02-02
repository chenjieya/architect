// console.log(process.pid);

// 监听当前进程的输入
process.stdin.on("data", (data) => {
  const str = `AI: ${data}`;

  // 输出的到父进程
  process.stdout.write(str);
});
