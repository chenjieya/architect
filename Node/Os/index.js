const os = require("os");
// 换行符
console.log(os.EOL);

// 系统架构
console.log(os.arch());

// cup内核
console.log(os.cpus());
console.log(os.cpus().length);

// 剩余多少内存(byte)
console.log(os.freemem());
console.log(os.freemem() / 2 ** 30);

// 家目录
console.log(os.homedir());

// 主机名
console.log(os.hostname());

// 临时目录
console.log(os.tmpdir());
