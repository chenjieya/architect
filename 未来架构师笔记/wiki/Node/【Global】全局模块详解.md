---
author: human
ai_editable: false
updated_by: human
updated: 2026-08-02
---
## 1. 概述

Node.js 提供了几个重要的全局对象和属性，无需使用 `require()` 即可直接使用。这些全局模块对于文件路径操作、进程控制和环境变量访问至关重要。本文将详细解析每个 API 的使用方法和实际应用场景。

## 2. \_\_dirname - 当前文件所在目录的绝对路径

### 2.1 功能描述

`__dirname` 是一个全局变量，返回当前执行脚本文件所在目录的**绝对路径**。它在每个模块中都有不同的值，取决于模块文件的位置。

### 2.2 核心特性

- **全局可用**：无需引入任何模块
- **模块级别**：每个模块有自己的 `__dirname`
- **绝对路径**：返回的是绝对路径，不是相对路径
- **动态解析**：基于文件实际位置

### 2.3 示例详解

```javascript
// 文件位于 /home/user/project/src/utils/helper.js

console.log(__dirname)
// 输出: /home/user/project/src/utils

// 与 require.main 对比
console.log(require.main.path)
// 输出: /home/user/project (项目根目录)

// 构建基于当前目录的路径
const configPath = require('path').join(__dirname, 'config.json')
console.log(configPath)
// 输出: /home/user/project/src/utils/config.json

// 在子模块中使用
// helper.js 中：
module.exports = {
  getDataPath: () => {
    return require('path').join(__dirname, 'data')
  },
}

// 另一个文件调用：
// 输出将是 helper.js 所在目录的 data 子目录
```

### 2.4 不同场景下的行为

```javascript
// 场景1：直接执行文件
// node /home/user/app.js
console.log(__dirname) // /home/user

// 场景2：通过符号链接执行
// ln -s /home/user/app.js /usr/local/bin/myapp
// 执行 myapp
console.log(__dirname) // /home/user (仍然是源文件位置)

// 场景3：在 REPL 中使用
// node
console.log(__dirname) // ReferenceError: __dirname is not defined
// 因为 REPL 没有文件上下文
```

### 2.5 实际应用场景

```javascript
// 1. 配置文件加载
class ConfigLoader {
  static load() {
    const configPath = require('path').join(__dirname, '..', 'config')

    const defaultConfig = require(configPath + '/default.json')
    const env = process.env.NODE_ENV || 'development'

    try {
      const envConfig = require(configPath + `/${env}.json`)
      return { ...defaultConfig, ...envConfig }
    } catch {
      return defaultConfig
    }
  }
}

// 2. 数据库连接配置
const dbConfig = {
  client: 'mysql',
  connection: {
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'test',
    charset: 'utf8',
  },
  migrations: {
    directory: require('path').join(__dirname, 'migrations'),
  },
  seeds: {
    directory: require('path').join(__dirname, 'seeds'),
  },
}

// 3. 静态资源服务
const express = require('express')
const app = express()

// 提供当前目录下的 public 文件夹作为静态资源
app.use(express.static(require('path').join(__dirname, 'public')))

// 4. 模块自动注册
function autoRegisterModules() {
  const fs = require('fs')
  const path = require('path')
  const modules = {}

  // 扫描当前目录下的所有 .js 文件（除了当前文件）
  const files = fs.readdirSync(__dirname)

  files.forEach((file) => {
    if (file.endsWith('.js') && file !== path.basename(__filename)) {
      const moduleName = path.basename(file, '.js')
      modules[moduleName] = require(path.join(__dirname, file))
    }
  })

  return modules
}

// 5. 安全路径解析（防止目录遍历攻击）
function safePathResolver(userInput) {
  const path = require('path')
  const absolutePath = path.resolve(__dirname, userInput)

  // 确保解析的路径不会逃逸当前目录
  if (!absolutePath.startsWith(__dirname)) {
    throw new Error('安全违规：试图访问当前目录之外的文件')
  }

  return absolutePath
}
```

### 2.6 注意事项

```javascript
// 1. ES6 模块中的 __dirname
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 2. 与 process.cwd() 的区别
console.log('__dirname:', __dirname) // 文件所在目录
console.log('process.cwd():', process.cwd()) // 执行命令的目录

// 3. 在子进程中
const { spawn } = require('child_process')
const child = spawn('node', ['child.js'], {
  cwd: __dirname, // 设置子进程工作目录
})
```

## 3. \_\_filename - 当前文件的绝对路径

### 3.1 功能描述

`__filename` 返回当前执行脚本文件的**完整绝对路径**，包含文件名本身。

### 3.2 核心特性

- 包含完整的文件名和扩展名
- 每个模块有自己独立的 `__filename`
- 始终是绝对路径

### 3.3 示例详解

```javascript
// 文件位于 /home/user/project/src/app.js

console.log(__filename)
// 输出: /home/user/project/src/app.js

// 获取文件信息
const fs = require('fs')
const path = require('path')

const fileStats = fs.statSync(__filename)
console.log({
  filename: path.basename(__filename),
  directory: path.dirname(__filename),
  extension: path.extname(__filename),
  size: fileStats.size,
  modified: fileStats.mtime,
  created: fileStats.birthtime,
})

// 与 import.meta.url 对比（ES6模块）
// ES6 模块中：
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
```

### 3.4 使用场景

```javascript
// 1. 自我引用检查
function isMainModule() {
  return require.main && require.main.filename === __filename
}

if (isMainModule()) {
  // 如果是主模块，执行应用逻辑
  startServer()
} else {
  // 如果是被引用的模块，导出功能
  module.exports = {
    /* ... */
  }
}

// 2. 文件版本管理
function getFileVersion() {
  const fs = require('fs')
  const crypto = require('crypto')

  const content = fs.readFileSync(__filename, 'utf8')
  const hash = crypto.createHash('md5').update(content).digest('hex')

  return hash.slice(0, 8) // 返回简短版本号
}

console.log(`当前文件版本: ${getFileVersion()}`)

// 3. 自动重新加载（开发环境）
if (process.env.NODE_ENV === 'development') {
  const chokidar = require('chokidar')

  // 监听当前文件的变化
  chokidar.watch(__filename).on('change', () => {
    console.log(`${path.basename(__filename)} 已更改，正在重新加载...`)

    // 清除模块缓存
    delete require.cache[__filename]

    try {
      require(__filename)
    } catch (error) {
      console.error('重新加载失败:', error.message)
    }
  })
}

// 4. 日志记录
class Logger {
  constructor() {
    this.sourceFile = path.basename(__filename)
  }

  log(message, level = 'INFO') {
    const timestamp = new Date().toISOString()
    console.log(`[${timestamp}] [${level}] [${this.sourceFile}] ${message}`)
  }
}

// 5. 构建工具中的文件处理
function processCurrentFile() {
  const babel = require('@babel/core')
  const fs = require('fs')

  const content = fs.readFileSync(__filename, 'utf8')

  // 使用 Babel 转换代码
  const result = babel.transformSync(content, {
    presets: ['@babel/preset-env'],
  })

  // 生成新的文件名
  const outputPath = __filename.replace(/\.js$/, '.compiled.js')
  fs.writeFileSync(outputPath, result.code)

  return outputPath
}
```

### 3.5 与相关属性的对比

```javascript
const path = require('path');

console.log('=== 文件路径相关属性对比 ===');
console.log('__filename:', __filename);
console.log('__dirname:', __dirname);
console.log('process.argv[1]:', process.argv[1]); // 执行的文件路径
console.log('require.main.filename:', require.main?.filename);
console.log('module.filename:', module.filename);

// 获取各个部分
const fileInfo = {
  完整路径: __filename,
  目录: path.dirname(__filename),
  文件名: path.basename(__filename),
  扩展名: path.extname(__filename),
  文件名(不含扩展名): path.basename(__filename, path.extname(__filename))
};

console.log('\n文件信息分解:');
Object.entries(fileInfo).forEach(([key, value]) => {
  console.log(`  ${key}: ${value}`);
});
```

## 4. process.cwd() - 当前工作目录

process是和命令相关的命令，所获取的是执行命令的目录。

### 4.1 功能描述

`process.cwd()` 返回 Node.js 进程的当前工作目录。这是启动进程时所在的目录，或者通过 `process.chdir()` 更改后的目录。

### 4.2 核心特性

- 进程级别的目录，不是文件级别的
- 可以被 `process.chdir()` 改变
- 影响相对路径的解析

### 4.3 示例详解

```javascript
// 假设我们在 /home/user 目录下执行：node /project/app.js

console.log(process.cwd())
// 输出: /home/user

// 改变工作目录
process.chdir('/tmp')
console.log(process.cwd())
// 输出: /tmp

// 相对路径基于当前工作目录
const fs = require('fs')
const relativePath = './data.json'

console.log('相对路径解析为:', require('path').resolve(relativePath))
// 如果当前目录是 /tmp，则输出: /tmp/data.json

// 切换回原始目录
process.chdir('/home/user')
```

### 4.4 实际应用场景

```javascript
// 1. 命令行工具的工作目录处理
class CLIApplication {
  constructor() {
    this.originalCwd = process.cwd()
    this.projectRoot = this.findProjectRoot()
  }

  findProjectRoot() {
    let currentDir = process.cwd()
    const path = require('path')

    // 向上查找直到找到 package.json
    while (currentDir !== path.parse(currentDir).root) {
      if (require('fs').existsSync(path.join(currentDir, 'package.json'))) {
        return currentDir
      }
      currentDir = path.dirname(currentDir)
    }

    return this.originalCwd
  }

  // 在项目根目录执行操作
  async runInProjectRoot(callback) {
    const originalCwd = process.cwd()

    try {
      process.chdir(this.projectRoot)
      return await callback()
    } finally {
      process.chdir(originalCwd)
    }
  }
}

// 2. 文件扫描器
function scanDirectory(directory = process.cwd()) {
  const fs = require('fs')
  const path = require('path')
  const results = []

  function scan(dir) {
    const items = fs.readdirSync(dir)

    items.forEach((item) => {
      const fullPath = path.join(dir, item)
      const stat = fs.statSync(fullPath)

      if (stat.isDirectory()) {
        scan(fullPath) // 递归扫描子目录
      } else {
        results.push({
          path: path.relative(process.cwd(), fullPath),
          size: stat.size,
          modified: stat.mtime,
        })
      }
    })
  }

  scan(directory)
  return results
}

// 3. 构建工具路径配置
const config = {
  // 基于当前工作目录的路径配置
  paths: {
    src: process.cwd() + '/src',
    dist: process.cwd() + '/dist',
    public: process.cwd() + '/public',
    nodeModules: process.cwd() + '/node_modules',
  },

  // 解析相对路径为绝对路径
  resolve(...paths) {
    return require('path').resolve(process.cwd(), ...paths)
  },

  // 获取相对于项目根目录的路径
  relative(targetPath) {
    return require('path').relative(process.cwd(), targetPath)
  },
}

// 4. 临时文件清理
function cleanupTempFiles() {
  const fs = require('fs')
  const path = require('path')
  const os = require('os')

  // 如果当前目录是临时目录，清理旧文件
  const tempDir = os.tmpdir()
  const currentDir = process.cwd()

  if (currentDir.startsWith(tempDir)) {
    const maxAge = 24 * 60 * 60 * 1000 // 24小时

    fs.readdirSync(currentDir).forEach((file) => {
      const filePath = path.join(currentDir, file)
      const stats = fs.statSync(filePath)

      if (Date.now() - stats.mtimeMs > maxAge) {
        fs.unlinkSync(filePath)
        console.log(`已清理: ${file}`)
      }
    })
  }
}
```

### 4.5 与 \_\_dirname 的对比

```javascript
console.log('=== process.cwd() vs __dirname ===\n')

console.log('当前工作目录 (process.cwd()):')
console.log('  ', process.cwd())
console.log('  含义: 执行 node 命令时所在的目录')
console.log('  特点: 可以改变 (process.chdir())')
console.log('  影响: 相对路径的解析基准\n')

console.log('文件所在目录 (__dirname):')
console.log('  ', __dirname)
console.log('  含义: 当前 JavaScript 文件所在的目录')
console.log('  特点: 固定不变，基于文件位置')
console.log('  影响: 模块内的路径解析基准\n')

console.log('实际示例:')
const path = require('path')

// 假设：
// 在 /home/user 执行: node /project/src/app.js
// 那么：
// process.cwd() = /home/user
// __dirname = /project/src

console.log('相对路径 "./config.json" 解析为:')
console.log('  基于 process.cwd():', path.resolve('./config.json'))
console.log('  基于 __dirname:', path.resolve(__dirname, './config.json'))
```

## 5. process.exit() - 退出进程

### 5.1 功能描述

`process.exit()` 方法用于终止 Node.js 进程。可以指定退出码来表明退出状态。

### 5.2 退出码含义

- `0`: 成功退出，无错误
- `1`: 未捕获的致命异常
- `2`: 未被使用（Bash 用于内置错误）
- `3`: 内部 JavaScript 解析错误
- `4`: 内部 JavaScript 评估错误
- `5`: 致命错误
- `6`: 非函数内部异常处理程序
- `7`: 内部异常处理程序运行时错误
- `8`: 未使用
- `9`: 无效参数
- `10`: 内部 JavaScript 运行时失败
- `12`: 无效的调试参数
- `13`: 未完成的 Top-Level Await
- `>128`: 信号退出

### 5.3 示例详解

```javascript
// 基本用法
console.log('程序开始执行')

// 正常退出
process.exit(0) // 后面的代码不会执行
console.log('这行不会执行')

// 错误退出
if (someErrorCondition) {
  console.error('发生严重错误')
  process.exit(1)
}

// 带延迟退出
setTimeout(() => {
  console.log('5秒后退出')
  process.exit(0)
}, 5000)
```

### 5.4 优雅退出模式

```javascript
// 1. 优雅退出处理
class Application {
  constructor() {
    this.isShuttingDown = false
    this.setupSignalHandlers()
  }

  setupSignalHandlers() {
    // 处理各种终止信号
    const signals = ['SIGINT', 'SIGTERM', 'SIGHUP']

    signals.forEach((signal) => {
      process.on(signal, async () => {
        if (this.isShuttingDown) return

        console.log(`接收到 ${signal} 信号，开始优雅关闭...`)
        this.isShuttingDown = true

        try {
          await this.cleanup()
          console.log('清理完成，退出进程')
          process.exit(0)
        } catch (error) {
          console.error('清理过程中发生错误:', error)
          process.exit(1)
        }
      })
    })
  }

  async cleanup() {
    // 1. 停止接受新请求
    console.log('停止接受新请求...')

    // 2. 完成进行中的操作
    console.log('等待进行中的操作完成...')
    await this.waitForPendingOperations()

    // 3. 关闭数据库连接
    console.log('关闭数据库连接...')
    await this.closeDatabaseConnections()

    // 4. 释放其他资源
    console.log('释放其他资源...')
    await this.releaseResources()
  }

  async waitForPendingOperations() {
    // 实现等待逻辑
    return new Promise((resolve) => setTimeout(resolve, 1000))
  }

  async closeDatabaseConnections() {
    // 关闭所有数据库连接
    return Promise.resolve()
  }

  async releaseResources() {
    // 释放其他资源
    return Promise.resolve()
  }
}

// 2. 带超时的退出
function gracefulExitWithTimeout(timeout = 10000) {
  return new Promise((resolve) => {
    let isExiting = false

    const exit = (code = 0) => {
      if (isExiting) return
      isExiting = true
      clearTimeout(timeoutId)
      process.exit(code)
    }

    const timeoutId = setTimeout(() => {
      console.error('优雅退出超时，强制退出')
      exit(1)
    }, timeout)

    // 设置信号处理器
    process.on('SIGTERM', () => {
      console.log('开始优雅退出...')
      performCleanup()
        .then(() => exit(0))
        .catch(() => exit(1))
    })

    resolve({ exit })
  })
}

// 3. 退出前的钩子函数
const exitHandlers = []

function addExitHandler(handler) {
  exitHandlers.push(handler)
}

process.on('beforeExit', async (code) => {
  console.log(`进程即将退出，退出码: ${code}`)

  for (const handler of exitHandlers) {
    try {
      await handler()
    } catch (error) {
      console.error('退出处理程序出错:', error)
    }
  }
})

// 添加退出处理程序
addExitHandler(async () => {
  console.log('执行清理操作...')
  // 清理逻辑
})

addExitHandler(async () => {
  console.log('生成退出报告...')
  // 报告生成逻辑
})
```

### 5.5 实际应用场景

```javascript
// 1. 命令行工具的退出处理
class CLI {
  constructor() {
    this.exitCode = 0
  }

  async run() {
    try {
      await this.executeCommand()
    } catch (error) {
      this.handleError(error)
    } finally {
      this.cleanup()
      process.exit(this.exitCode)
    }
  }

  handleError(error) {
    console.error(`错误: ${error.message}`)

    if (error.code === 'ENOENT') {
      console.error('文件或目录不存在')
      this.exitCode = 2
    } else if (error.code === 'EACCES') {
      console.error('权限不足')
      this.exitCode = 3
    } else {
      console.error('未知错误')
      this.exitCode = 1
    }
  }

  cleanup() {
    // 清理临时文件等
  }
}

// 2. 守护进程管理
class Daemon {
  start() {
    // 检查是否已经运行
    if (this.isAlreadyRunning()) {
      console.error('守护进程已经在运行')
      process.exit(1)
    }

    // 创建 PID 文件
    this.createPidFile()

    // 设置为守护进程
    this.daemonize()
  }

  stop() {
    try {
      // 发送停止信号
      this.sendStopSignal()

      // 等待停止
      setTimeout(() => {
        // 移除 PID 文件
        this.removePidFile()
        console.log('守护进程已停止')
        process.exit(0)
      }, 2000)
    } catch (error) {
      console.error('停止守护进程失败:', error)
      process.exit(1)
    }
  }

  restart() {
    this.stop()
    // 重新启动逻辑
  }
}

// 3. 测试框架中的退出处理
class TestRunner {
  async runTests() {
    let passed = 0
    let failed = 0

    try {
      for (const test of this.tests) {
        try {
          await test.run()
          passed++
        } catch (error) {
          console.error(`测试失败: ${test.name}`, error)
          failed++
        }
      }

      console.log(`\n测试结果: ${passed} 通过, ${failed} 失败`)

      // 如果有失败的测试，以非零退出码退出
      if (failed > 0) {
        process.exit(1)
      }

      process.exit(0)
    } catch (error) {
      console.error('测试运行器出错:', error)
      process.exit(2)
    }
  }
}
```

## 6. process.argv - 命令行参数

### 6.1 功能描述

`process.argv` 返回一个数组，包含启动 Node.js 进程时传递的命令行参数。

### 6.2 数组结构

- `process.argv[0]`: Node.js 可执行文件的绝对路径
- `process.argv[1]`: 正在执行的 JavaScript 文件的绝对路径
- `process.argv[2...]`: 传递给脚本的额外命令行参数

### 6.3 示例详解

```javascript
// 假设执行: node app.js --port 3000 --env production

console.log('process.argv 数组:')
process.argv.forEach((val, index) => {
  console.log(`${index}: ${val}`)
})

// 输出:
// 0: /usr/local/bin/node
// 1: /path/to/app.js
// 2: --port
// 3: 3000
// 4: --env
// 5: production

// 提取参数
const args = process.argv.slice(2)
console.log('用户参数:', args)
// 输出: ['--port', '3000', '--env', 'production']
```

### 6.4 命令行参数解析库

```javascript
// 1. 手动解析简单参数
function parseSimpleArgs() {
  const args = process.argv.slice(2)
  const parsed = {}

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]

    if (arg.startsWith('--')) {
      // 长参数: --key value 或 --key=value
      const key = arg.slice(2)

      if (args[i + 1] && !args[i + 1].startsWith('-')) {
        // --key value 格式
        parsed[key] = args[i + 1]
        i++
      } else if (arg.includes('=')) {
        // --key=value 格式
        const [k, v] = arg.split('=')
        parsed[k.slice(2)] = v
      } else {
        // 布尔标志: --flag
        parsed[key] = true
      }
    } else if (arg.startsWith('-')) {
      // 短参数: -x value 或 -xyz
      const key = arg.slice(1)

      if (args[i + 1] && !args[i + 1].startsWith('-')) {
        // -x value 格式
        parsed[key] = args[i + 1]
        i++
      } else {
        // 布尔标志: -x 或 -xyz
        if (key.length === 1) {
          parsed[key] = true
        } else {
          // -xyz 拆分为 x: true, y: true, z: true
          key.split('').forEach((k) => {
            parsed[k] = true
          })
        }
      }
    } else {
      // 位置参数
      if (!parsed._) parsed._ = []
      parsed._.push(arg)
    }
  }

  return parsed
}

// 2. 使用 yargs 库（推荐）
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')

const argv = yargs(hideBin(process.argv))
  .option('port', {
    alias: 'p',
    type: 'number',
    description: '端口号',
    default: 3000,
  })
  .option('env', {
    alias: 'e',
    type: 'string',
    description: '环境变量',
    choices: ['development', 'production', 'test'],
    default: 'development',
  })
  .option('verbose', {
    alias: 'v',
    type: 'boolean',
    description: '详细输出',
    default: false,
  })
  .command('start', '启动服务器')
  .command('stop', '停止服务器')
  .command('restart', '重启服务器')
  .demandCommand(1, '需要指定一个命令')
  .help().argv

// 3. 使用 commander 库
const { Command } = require('commander')
const program = new Command()

program.name('myapp').description('一个示例应用').version('1.0.0')

program
  .command('serve')
  .description('启动服务器')
  .option('-p, --port <number>', '端口号', '3000')
  .option('-h, --host <string>', '主机名', 'localhost')
  .action((options) => {
    console.log('启动服务器:', options)
  })

program
  .command('build')
  .description('构建项目')
  .option('-m, --mode <string>', '构建模式', 'development')
  .action((options) => {
    console.log('构建项目:', options)
  })

program.parse(process.argv)
```

### 6.5 实际应用场景

```javascript
// 1. 配置管理系统
class ConfigManager {
  static loadFromArgs() {
    const args = process.argv.slice(2)
    const config = {
      port: 3000,
      host: 'localhost',
      env: 'development',
      logLevel: 'info',
    }

    for (let i = 0; i < args.length; i++) {
      const arg = args[i]

      switch (arg) {
        case '--port':
        case '-p':
          config.port = parseInt(args[++i], 10)
          break

        case '--host':
        case '-h':
          config.host = args[++i]
          break

        case '--env':
        case '-e':
          config.env = args[++i]
          break

        case '--log-level':
        case '-l':
          config.logLevel = args[++i]
          break

        case '--help':
          this.showHelp()
          process.exit(0)
          break

        case '--version':
          console.log('v1.0.0')
          process.exit(0)
          break
      }
    }

    return config
  }

  static showHelp() {
    console.log(`
使用方法: node app.js [选项]

选项:
  -p, --port <端口>     设置端口号 (默认: 3000)
  -h, --host <主机>     设置主机名 (默认: localhost)
  -e, --env <环境>      设置环境 (development/production)
  -l, --log-level <级别> 设置日志级别 (debug/info/warn/error)
      --help            显示帮助信息
      --version         显示版本信息
    `)
  }
}

// 2. 文件处理器
function processFilesFromArgs() {
  const args = process.argv.slice(2)
  const fs = require('fs')
  const path = require('path')

  // 第一个参数是命令
  const command = args[0]

  switch (command) {
    case 'compress':
      const files = args.slice(1)
      files.forEach((file) => {
        console.log(`压缩文件: ${file}`)
        // 压缩逻辑
      })
      break

    case 'extract':
      const archive = args[1]
      const outputDir = args[2] || process.cwd()
      console.log(`解压 ${archive} 到 ${outputDir}`)
      // 解压逻辑
      break

    case 'list':
      const dir = args[1] || '.'
      const items = fs.readdirSync(dir)
      items.forEach((item) => console.log(item))
      break

    default:
      console.error('未知命令。可用命令: compress, extract, list')
      process.exit(1)
  }
}

// 3. 开发服务器
function startDevServer() {
  const args = process.argv.slice(2)
  const http = require('http')

  // 解析参数
  let port = 3000
  let host = 'localhost'
  let openBrowser = false

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]

    if (arg === '--port' || arg === '-p') {
      port = parseInt(args[++i], 10)
    } else if (arg === '--host') {
      host = args[++i]
    } else if (arg === '--open' || arg === '-o') {
      openBrowser = true
    }
  }

  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' })
    res.end('开发服务器运行中\n')
  })

  server.listen(port, host, () => {
    console.log(`服务器运行在 http://${host}:${port}`)

    if (openBrowser) {
      const { exec } = require('child_process')
      const url = `http://${host}:${port}`

      // 跨平台打开浏览器
      const command =
        process.platform === 'win32'
          ? `start ${url}`
          : process.platform === 'darwin'
            ? `open ${url}`
            : `xdg-open ${url}`

      exec(command)
    }
  })

  return server
}
```

## 7. process.platform - 操作系统平台

### 7.1 功能描述

`process.platform` 返回标识操作系统平台的字符串。

### 7.2 常见平台值

- `'aix'`: IBM AIX
- `'darwin'`: macOS
- `'freebsd'`: FreeBSD
- `'linux'`: Linux
- `'openbsd'`: OpenBSD
- `'sunos'`: Solaris
- `'win32'`: Windows（32位或64位）
- `'android'`: Android（Node.js 14+）

### 7.3 示例详解

```javascript
console.log('当前操作系统平台:', process.platform)

// 平台特定逻辑
switch (process.platform) {
  case 'win32':
    console.log('运行在 Windows 系统上')
    console.log('路径分隔符: \\')
    console.log('默认换行符: \\r\\n')
    break

  case 'darwin':
    console.log('运行在 macOS 系统上')
    console.log('路径分隔符: /')
    console.log('默认换行符: \\n')
    break

  case 'linux':
    console.log('运行在 Linux 系统上')
    console.log('路径分隔符: /')
    console.log('默认换行符: \\n')
    break

  default:
    console.log('运行在其他系统上')
}
```

### 7.4 跨平台兼容性处理

```javascript
// 1. 路径处理
class CrossPlatformPaths {
  static getHomeDir() {
    switch (process.platform) {
      case 'win32':
        return (
          process.env.USERPROFILE ||
          process.env.HOMEDRIVE + process.env.HOMEPATH
        )
      default:
        return process.env.HOME
    }
  }

  static getConfigDir(appName) {
    const path = require('path')

    switch (process.platform) {
      case 'win32':
        return path.join(process.env.APPDATA || '', appName)
      case 'darwin':
        return path.join(
          this.getHomeDir(),
          'Library',
          'Application Support',
          appName,
        )
      default:
        const configDir =
          process.env.XDG_CONFIG_HOME || path.join(this.getHomeDir(), '.config')
        return path.join(configDir, appName)
    }
  }

  static getTempDir() {
    switch (process.platform) {
      case 'win32':
        return process.env.TEMP || process.env.TMP || 'C:\\Windows\\Temp'
      default:
        return process.env.TMPDIR || '/tmp'
    }
  }
}

// 2. 命令执行
function executeCommand(command) {
  const { exec } = require('child_process')

  // 根据平台调整命令
  let platformCommand = command

  if (process.platform === 'win32') {
    // Windows 需要 cmd /c
    platformCommand = `cmd /c "${command}"`
  }

  return new Promise((resolve, reject) => {
    exec(platformCommand, (error, stdout, stderr) => {
      if (error) {
        reject(error)
      } else {
        resolve({ stdout, stderr })
      }
    })
  })
}

// 3. 文件权限
function setExecutablePermission(filePath) {
  const fs = require('fs')

  if (process.platform !== 'win32') {
    // Unix-like 系统需要设置执行权限
    fs.chmodSync(filePath, 0o755) // rwxr-xr-x
  }
  // Windows 不需要设置执行权限
}

// 4. 终端颜色支持检测
function supportsColor() {
  // Windows 10 以上版本支持颜色
  if (process.platform === 'win32') {
    const os = require('os')
    const version = os.release()
    const [major] = version.split('.').map(Number)
    return major >= 10
  }

  // Unix-like 系统通常支持颜色
  return true
}
```

### 7.5 实际应用场景

```javascript
// 1. 构建脚本
const buildScripts = {
  // 跨平台的清理命令
  clean: () => {
    const { execSync } = require('child_process');

    if (process.platform === 'win32') {
      execSync('if exist dist rmdir /s /q dist', { stdio: 'inherit' });
    } else {
      execSync('rm -rf dist', { stdio: 'inherit' });
    }
  },

  // 跨平台的复制命令
  copyAssets: () => {
    const fs = require('fs');
    const path = require('path');

    const srcDir = 'src/assets';
    const distDir = 'dist/assets';

    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir, { recursive: true });
    }

    // 递归复制文件
    function copyRecursive(src, dest) {
      const stat = fs.statSync(src);

      if (stat.isDirectory()) {
        if (!fs.existsSync(dest)) {
          fs.mkdirSync(dest);
        }

        fs.readdirSync(src).forEach(item => {
          copyRecursive(path.join(src, item), path.join(dest, item));
        });
      } else {
        fs.copyFileSync(src, dest);
      }
    }

    copyRecursive(srcDir, distDir);
  },

  // 平台特定的构建
  build: () => {
    const platform = process.platform;
    const arch = process.arch;

    console.log(`为 ${platform}-${arch} 构建...`);

    // 平台特定的构建逻辑
    switch (platform) {
      case 'win32':
        // Windows 构建逻辑
        break;
      case 'darwin':
        // macOS 构建逻辑
        break;
      case 'linux':
        // Linux 构建逻辑
        break;
    }
```
